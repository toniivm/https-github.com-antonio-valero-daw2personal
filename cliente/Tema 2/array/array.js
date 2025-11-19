const array1 = [1, 2, 3, 6, 5, 4, 10, 8, 7, 3];
const array2 = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const array3 = [1, 2, 3];
const array4 = [1, 3, 2];

const array5 = ['Nepal', 'India', 'Bhutan', 'China'];

function checkArraysSize(arr1, arr2) {
    if(arr1.length !== arr2.length) {
        alert("Arrays have different sizes");
    }
    else {
        alert("Arrays have the same size");
    }
}

function checkArrayEquality(arr1, arr2) {
    if(arr1.length !== arr2.length) {
        return false;
    }

    for (let i=0; i < arr1.length; i++) {
        if(arr1[i] !== arr2[i]) {
            return false;
        }
    }

    /*for (let i in arr1) {
        if(arr1[i] !== arr2[i]) {
            return false;
        }
    }*/

    return true;

}

function checkArraysValues(arr1, arr2) {
    arr1.sort();
    arr2.sort();
    return checkArrayEquality(arr1, arr2);
}

console.log(checkArraysValues(array1, array2));




function elementFrequency(arr, element) {
    let count = 0;

    for (let e of arr) {
        if(e === element) {
            count++;
        }
    }

    console.log("Number of " + element + " is: " + count);
    return count;
}


function findMax(arr) {
    arr.sort();
    return arr[arr.length - 1];
}