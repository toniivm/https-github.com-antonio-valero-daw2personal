public class Bucles {

    public static void main(String[] args) {
        /* 
        System.out.println("Ejemplo bucles");


        // Bucle for
        for (int i = -100; i <= 100; i++) {
            System.out.println("Iteración for: " + i);
        }


        // Bucle while desde -100 hasta 100
        int j = -100;
        while (j <= 100) {
            System.out.println("Iteración while: " + j);
            j++;
        }

        // Bucle do-while desde -100 hasta 100
        int k = -100;
        do {
            System.out.println("Iteración do-while: " + k);
            k++;
        } while (k <= 100);


        //Pedir al usuario un número entre postivo
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int numero;

        do {
            System.out.print("Introduce un número positivo: ");
            numero = scanner.nextInt();
        } while (numero < 0);

        System.out.println("Has introducido el número positivo: " + numero);




        int opcion;

        do{
            System.out.println("MENU CALCULO AREAS");
            System.out.println("1. Area del cuadrado");
            System.out.println("2. Area del triangulo");
            System.out.println("3. Area del circulo");
            System.out.println("4. Salir");
            opcion = scanner.nextInt();

            switch (opcion) {
                case 1:       
                default:
                    break;
            }

        } while(opcion!=4);

        */

        primosHastaN(1000000);

    }


    public static boolean esPrimo(int numero){
        int multiplo = 0;
        for(int i = 1; i<=numero; i++){
            if(numero % i == 0){
                multiplo++;
            }
        }

        if(multiplo == 2){
            return true;
        } else {
            return false;
        }
    }

    public static boolean esPrimoMejorado(int numero){
        int multiplo = 0;
        for(int i = 1; i<=numero; i++){
            if(numero % i == 0){
                multiplo++;
            }
            if(multiplo > 2){
                return false;
            }
        }

        return true;
    }

    public static boolean ePrimoMejorado2(int numero){
        if(numero < 2){
            return false;
        }

        for(int i = 2; i <= Math.sqrt(numero); i++){
            if(numero % i == 0){
                return false;
            }
        }

        return true;
    }

    public static void primosHastaN(int n){
        for(int i = 1; i<=n; i++){
            if(ePrimoMejorado2(i)){
                System.out.println(i + " es primo");
            }
        }
    }
}