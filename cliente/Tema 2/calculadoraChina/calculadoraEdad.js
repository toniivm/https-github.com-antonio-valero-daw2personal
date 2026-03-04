

const HOROSCOPE = [ "Mono", "Gallo", "Perro", "Cerdo", "Rata", 
    "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra" ]; 

function calculateAge(){

    let year = document.getElementById("yearOfBirth").value;
    let month = document.getElementById("monthOfBirth").value;
    let day = document.getElementById("dayOfBirth").value;


    if(isValidDate(year, month, day)){
        let yearOfBirth = document.getElementById("yearOfBirth").value;

        let age = cEdad();

        document.getElementById("result").innerHTML = "Tu edad es: " + age + " años.";

        let index = yearOfBirth % 12;
        let animal = HOROSCOPE[index];
        document.getElementById("result").innerHTML += "<br>Tu animal del zodiaco chino es: " + animal;
    }

    else{
        alert("Fecha introducida no válida");
    }

    
}


function isValidDate(year, month, day){
    if(year > 1 && year <= new Date().getFullYear()
        && month >= 1 && month <= 12
        && day >= 1 && day <= 31
    ){
        return true;
    }
    return false;
}


function cEdad(){
    let year = document.getElementById("yearOfBirth").value;
    let month = document.getElementById("monthOfBirth").value;
    let day = document.getElementById("dayOfBirth").value;

   // let yearDate = document.getElementById("dateOfBirth").value.getFullYear();
   // let monthDate = document.getElementById("dateOfBirth").value.getMonth();
   // let dayDate = document.getElementById("dateOfBirth").value.getDay();

    let actualDate = new Date();
    let actualDay = actualDate.getUTCDate();
    let actualMonth = actualDate.getMonth()+1;
    
    let age = actualDate.getFullYear() - year;
    
    if((month > actualMonth) || 
        (month == actualMonth && day > actualDay)){
        age--;
    }
    return age;
}


