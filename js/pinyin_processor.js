// js/pinyin_processor.js
(function(window) {
    // 使用window对象上的拼音数据字典
    const PHRASE_DICT = window.PHRASE_DICT || {};
    const CHAR_DICT = window.CHAR_DICT || {};

    class PinyinConverter {
        constructor() {
            const keys = Object.keys(PHRASE_DICT);
            this.maxPhraseLength = keys.reduce((max, key) => {
                return key.length > max ? key.length : max;
            }, 0) || 4;
        }

        // 最大正向匹配分词
        segment(text) {
            var result = [];
            var pos = 0;
            var textLen = text.length;

            while (pos < textLen) {
                var found = false;
                var maxLen = Math.min(this.maxPhraseLength, textLen - pos);

                for (var len = maxLen; len > 0; len--) {
                    var candidate = text.substr(pos, len);
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
            var segments = this.segment(text);

            // 中文标点转英文标点映射
            var punctuationMap = {
                '。': '.', '，': ',', '？': '?', '！': '!', '：': ':', '；': ';',
                '“': '"', '”': '"', '‘': "'", '’': "'", '／': '/', '（': '(', '）': ')',
                '＆': '&', '－': '-', '＿': '_', '＝': '=', '＋': '+', '＠': '@', '＄': '$'
            };

            var isAscii = function(ch) { return /^[A-Za-z0-9]$/.test(ch); };
            var isAsciiPunct = function(ch) { return /[.,?!:;"'\/()&\-_=+@$]/.test(ch); };

            return segments.map(function(seg) {
                if (seg.length > 1 && PHRASE_DICT[seg]) {
                    return PHRASE_DICT[seg];
                }
                var ch = seg;
                if (isAscii(ch) || isAsciiPunct(ch)) return ch;
                if (punctuationMap[ch]) return punctuationMap[ch];

                // 先查字典
                var pinyins = CHAR_DICT[ch];
                if (pinyins && pinyins.length > 0) return pinyins[0];

                // 如果字典没有，在词组里找
                for (var phrase in PHRASE_DICT) {
                    if (PHRASE_DICT.hasOwnProperty(phrase)) {
                        var py_str = PHRASE_DICT[phrase];
                        var idx = phrase.indexOf(ch);
                        if (idx !== -1) {
                            // 找到含有该字的词组
                            // 词组拼音用空格分隔
                            var pyArr = py_str.split(' ');
                            if (pyArr.length === phrase.length && pyArr[idx]) {
                                return pyArr[idx];
                            }
                        }
                    }
                }

                // 查无拼音
                return '?';
            }).join(' ');
        }
    }

    // 挂载到window对象上
    window.PinyinConverter = PinyinConverter;
})(window);