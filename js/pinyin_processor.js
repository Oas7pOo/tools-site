// js/pinyin_processor.js
import { PHRASE_DICT, CHAR_DICT } from './pinyin_data.js';

class PinyinConverter {
    constructor() {
        const keys = Object.keys(PHRASE_DICT);
        this.maxPhraseLength = keys.reduce((max, key) => {
            return key.length > max ? key.length : max;
        }, 0) || 4;
    }

    // 最大正向匹配分词
    segment(text) {
        const result = [];
        let pos = 0;
        const textLen = text.length;

        while (pos < textLen) {
            let found = false;
            const maxLen = Math.min(this.maxPhraseLength, textLen - pos);

            for (let len = maxLen; len > 0; len--) {
                const candidate = text.substr(pos, len);
                if (PHRASE_DICT[candidate]) {
                    result.push(candidate);
                    pos += len;
                    found = true;
                    break;
                }
            }

            if (!found) {
                result.push(text[pos]);
                pos++;
            }
        }
        return result;
    }

    // 转换中文到拼音
    convert(text) {
        const segments = this.segment(text);

        // 中文标点转英文标点映射
        const punctuationMap = {
            '。': '.', '，': ',', '？': '?', '！': '!', '：': ':', '；': ';',
            '“': '"', '”': '"', '‘': "'", '’': "'", '／': '/', '（': '(', '）': ')',
            '＆': '&', '－': '-', '＿': '_', '＝': '=', '＋': '+', '＠': '@', '＄': '$'
        };

        const isAscii = ch => /^[A-Za-z0-9]$/.test(ch);
        const isAsciiPunct = ch => /[.,?!:;"'\/()&\-_=+@$]/.test(ch);

        return segments.map(seg => {
            if (seg.length > 1 && PHRASE_DICT[seg]) {
                return PHRASE_DICT[seg];
            }
            const ch = seg;
            if (isAscii(ch) || isAsciiPunct(ch)) return ch;
            if (punctuationMap[ch]) return punctuationMap[ch];

            // 先查字典
            const pinyins = CHAR_DICT[ch];
            if (pinyins && pinyins.length > 0) return pinyins[0];

            // 如果字典没有，在词组里找
            for (const [phrase, py_str] of Object.entries(PHRASE_DICT)) {
                const idx = phrase.indexOf(ch);
                if (idx !== -1) {
                    // 找到含有该字的词组
                    // 词组拼音用空格分隔
                    const pyArr = py_str.split(' ');
                    if (pyArr.length === phrase.length && pyArr[idx]) {
                        return pyArr[idx];
                    }
                }
            }

            // 查无拼音
            return '?';
        }).join(' ');
    }
}

export default PinyinConverter;