// Prefer a real glyph-bearing display face for names outside Georgia's alphabet.
export function displayFamily(name){
 if(/[\u0590-\u08ff]/u.test(name))return '"Times New Roman", Arial, serif';
 if(/[\u3000-\u9fff\uf900-\uffef]/u.test(name))return '"Microsoft YaHei", Arial, sans-serif';
 return 'Georgia, serif';
}
