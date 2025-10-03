// Ejemplos curiosos de JavaScript con explicación en comentarios

// 1. 0.1 + 0.2 no es exactamente 0.3
console.log('0.1 + 0.2 === 0.3 ?', 0.1 + 0.2 === 0.3);
// false porque los números decimales en JavaScript no siempre se representan de forma exacta

// 2. typeof NaN
console.log('typeof NaN:', typeof NaN);
// Devuelve "number" aunque NaN significa "Not a Number", por cómo está definido en el lenguaje

// 3. coerción con + entre arrays y objetos
console.log('[] + [] =', [] + []);
console.log('[] + {} =', [] + {});
console.log('{} + [] =', {} + []);
// El operador + convierte los operandos a string, lo que da resultados inesperados

// 4. == vs ===
console.log('0 == false', 0 == false);  // true porque == hace conversión de tipos
console.log('0 === false', 0 === false); // false porque === compara tipo y valor

// 5. claves de objeto con otro objeto
const a = {};
const b = {x:1};
a[b] = 123;
console.log('a[b] =', a[b]);
// Cuando se usa un objeto como clave, se convierte a string: '[object Object]'
