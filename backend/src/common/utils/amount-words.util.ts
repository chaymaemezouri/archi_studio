function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function under20(n: number): string {
  const units = [
    'zéro',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
  ];
  const teens = [
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  return '';
}

function under100(n: number): string {
  if (n < 20) return under20(n);
  if (n < 70) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    const tens = [
      '',
      'dix',
      'vingt',
      'trente',
      'quarante',
      'cinquante',
      'soixante',
    ];
    if (unit === 0) return tens[ten];
    if (unit === 1 && ten !== 8) return `${tens[ten]}-et-un`;
    return `${tens[ten]}-${under20(unit)}`;
  }
  if (n < 80) {
    const rest = n - 60;
    return rest === 11 ? 'soixante-onze' : `soixante-${under20(rest)}`;
  }
  if (n < 100) {
    const rest = n - 80;
    if (rest === 0) return 'quatre-vingts';
    return rest === 1 ? 'quatre-vingt-un' : `quatre-vingt-${under20(rest)}`;
  }
  return '';
}

function under1000(n: number): string {
  if (n < 100) return under100(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let prefix = '';
  if (hundreds === 1) prefix = 'cent';
  else prefix = `${under20(hundreds)} cent`;
  if (rest === 0 && hundreds > 1) prefix += 's';
  return rest ? `${prefix} ${under100(rest)}` : prefix;
}

function convertInteger(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 1000) return under1000(n);

  const scales = [
    { value: 1_000_000_000, label: 'milliard' },
    { value: 1_000_000, label: 'million' },
    { value: 1000, label: 'mille' },
  ];

  for (const scale of scales) {
    if (n >= scale.value) {
      const count = Math.floor(n / scale.value);
      const rest = n % scale.value;
      let head = '';
      if (scale.label === 'mille' && count === 1) head = 'mille';
      else {
        head = `${convertInteger(count)} ${scale.label}`;
        if (count > 1 && scale.label !== 'mille') head += 's';
      }
      return rest ? `${head} ${convertInteger(rest)}` : head;
    }
  }
  return '';
}

export function amountToFrenchWords(
  amount: number,
  currencySingular = 'dirham',
  currencyPlural = 'dirhams',
): string {
  const rounded = Math.round(Math.abs(amount));
  const words = convertInteger(rounded);
  const currency = rounded <= 1 ? currencySingular : currencyPlural;
  return `${capitalize(words)} ${currency}`;
}
