# generate_polyphonic_dict.py
import json
import os
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from pypinyin import pinyin, Style
import requests

# 配置参数
OUTPUT_JS = "pinyin_data.js"  # 输出JS文件路径
DICT_CACHE_DIR = ".dict_cache"  # 词典缓存目录
DICT_SOURCES = [
    {
        "name": "jieba_big_dict",
        "url": "https://github.com/fxsjy/jieba/raw/master/extra_dict/dict.txt.big",
        "type": "text"
    },
    {
        "name": "modern_chinese",
        "url": "https://raw.githubusercontent.com/cmusphinx/cmudict/master/scripts/mandarin_words.txt",
        "type": "text"
    },
    {
        "name": "wikipedia_phrases",
        "url": "https://github.com/brightmart/nlp_chinese_corpus/raw/master/dictionary/word/phrase.txt.zip",
        "type": "zip"
    }
]

THREADS = 8  # 线程数
BATCH_SIZE = 1000  # 批处理量


class DictProcessor:
    def __init__(self):
        self.lock = Lock()
        self.all_phrases = []
        self.char_pinyin_map = {}  # 多音字字典 {字: [拼音]}
        self.poly_phrases = {}  # 多音字词组字典 {词组: 拼音}
        self.processed_phrases = set()
        self.current_index = 0

        # 初始化环境
        os.makedirs(DICT_CACHE_DIR, exist_ok=True)

        # 加载词典
        self.load_dictionaries()

        # 加载进度
        self.state_file = os.path.join(DICT_CACHE_DIR, "progress.json")
        if os.path.exists(self.state_file):
            self.load_progress()

    def download_file(self, url):
        """下载并缓存词典文件（增强版）"""
        filename = os.path.join(DICT_CACHE_DIR, url.split("/")[-1])
        if not os.path.exists(filename):
            print(f"正在下载词典文件: {url}")
            try:
                r = requests.get(url, stream=True, timeout=60)
                r.raise_for_status()
                with open(filename, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                return filename
            except Exception as e:
                print(f"下载失败: {url} - {str(e)}")
                try:
                    os.remove(filename)
                except:
                    pass
                return None
        return filename

    def load_dictionaries(self):
        """加载多源词典"""
        print("开始加载词典资源...")

        for source in DICT_SOURCES:
            file_path = self.download_file(source["url"])
            if not file_path:
                continue

            try:
                if source["type"] == "zip":
                    with zipfile.ZipFile(file_path) as z:
                        for name in z.namelist():
                            with z.open(name) as f:
                                content = f.read().decode("utf-8")
                                self.parse_content(content, source["name"])
                else:
                    with open(file_path, "r", encoding="utf-8") as f:
                        self.parse_content(f.read(), source["name"])
            except Exception as e:
                print(f"解析词典失败: {source['name']} - {str(e)}")

        # 去重处理
        self.all_phrases = list(set(self.all_phrases))
        print(f"共加载 {len(self.all_phrases)} 个候选词组")

    def parse_content(self, content, source_name):
        """解析不同格式的词典内容"""
        # 结巴词典格式：单词 词频 词性
        if source_name == "jieba_big_dict":
            for line in content.split("\n"):
                parts = line.strip().split(" ")
                if len(parts) >= 1 and len(parts[0]) > 1:
                    self.all_phrases.append(parts[0])

        # 通用词典格式：每行一个词组
        else:
            for line in content.split("\n"):
                phrase = line.strip()
                if len(phrase) > 1:
                    self.all_phrases.append(phrase)

    def process_batch(self, batch):
        """处理一批词组（增强版）"""
        batch_results = {}
        for phrase in batch:
            if phrase in self.processed_phrases:
                continue

            try:
                # 获取并验证拼音
                raw_pinyin = pinyin(
                    phrase,
                    style=Style.NORMAL,
                    heteronym=True,
                    errors='ignore'
                )

                # 过滤无效拼音
                valid_pinyin = []
                for py_group in raw_pinyin:
                    filtered = [py for py in py_group if py and py.isalnum()]
                    valid_pinyin.append(filtered if filtered else [''])

                # 记录多音字
                with self.lock:
                    for char, pys in zip(phrase, valid_pinyin):
                        if len(pys) > 1:  # 仅记录多音字
                            current = self.char_pinyin_map.get(char, [])
                            new_pys = [py for py in pys if py not in current]
                            if new_pys:
                                self.char_pinyin_map[char] = current + new_pys

                # 记录词组的第一个有效拼音组合
                if valid_pinyin:
                    batch_results[phrase] = " ".join([p[0] for p in valid_pinyin])

            except Exception as e:
                print(f"处理词组'{phrase}'时出错: {str(e)}")

        return batch_results

    def save_progress(self):
        """保存进度状态"""
        state = {
            "current_index": self.current_index,
            "processed_phrases": list(self.processed_phrases),
            "char_pinyin_map": self.char_pinyin_map,
            "poly_phrases": self.poly_phrases
        }
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(state, f, ensure_ascii=False)

    def load_progress(self):
        """加载进度状态（增强版）"""
        if not os.path.exists(self.state_file):
            return

        try:
            with open(self.state_file, "r", encoding="utf-8") as f:
                state = json.load(f)

            # 类型安全转换
            self.char_pinyin_map = {
                k: v if isinstance(v, list) else [v]
                for k, v in state.get("char_pinyin_map", {}).items()
            }
            self.poly_phrases = state.get("poly_phrases", {})
            self.current_index = state.get("current_index", 0)
            self.processed_phrases = set(state.get("processed_phrases", []))

            print(f"恢复进度：已处理 {len(self.processed_phrases)} 词组")
        except Exception as e:
            print(f"加载进度失败: {str(e)}")
            self.char_pinyin_map = {}
            self.poly_phrases = {}

    def run(self):
        try:
            # 第一阶段：处理所有词组
            with ThreadPoolExecutor(max_workers=THREADS) as executor:
                total_phrases = len(self.all_phrases)
                futures = []

                # 分批提交任务
                for start in range(self.current_index, total_phrases, BATCH_SIZE):
                    end = min(start + BATCH_SIZE, total_phrases)
                    batch = self.all_phrases[start:end]
                    futures.append(executor.submit(self.process_batch, batch))

                # 处理结果
                for future in as_completed(futures):
                    batch_result = future.result()
                    with self.lock:
                        self.poly_phrases.update(batch_result)
                        self.processed_phrases.update(batch_result.keys())
                    self.current_index += BATCH_SIZE

                    # 定期保存进度
                    if self.current_index % (BATCH_SIZE * 10) == 0:
                        self.save_progress()
                        print(f"处理进度: {self.current_index}/{total_phrases} "
                              f"({self.current_index / total_phrases:.1%})")

            # 第二阶段：安全筛选结果
            print("筛选最终多音字词组...")
            with self.lock:
                poly_chars = set(self.char_pinyin_map.keys())

            final_phrases = {}
            for phrase, pinyin_str in self.poly_phrases.items():
                if any((char in poly_chars) for char in phrase):
                    final_phrases[phrase] = pinyin_str

            # 保存为JS文件
            with open(OUTPUT_JS, "w", encoding="utf-8") as f:
                f.write("// 自动生成的多音字数据\n")
                f.write(f"const POLYPHONE_CHARS = {json.dumps(self.char_pinyin_map, ensure_ascii=False, indent=2)};\n")
                f.write(f"const POLYPHONE_PHRASES = {json.dumps(final_phrases, ensure_ascii=False, indent=2)};\n")
                f.write("export { POLYPHONE_CHARS, POLYPHONE_PHRASES };\n")

            # 安全删除进度文件
            if os.path.exists(self.state_file):
                os.remove(self.state_file)

            print(f"生成完成！")
            print(f"- 多音字数量: {len(self.char_pinyin_map)}")
            print(f"- 多音字词组数量: {len(final_phrases)}")

        except KeyboardInterrupt:
            print("\n用户中断，保存进度...")
            self.save_progress()
            exit()
        except Exception as e:
            print(f"运行出错: {str(e)}")
            self.save_progress()


if __name__ == "__main__":
    processor = DictProcessor()
    processor.run()