pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        FIREBASE_TOKEN = credentials('firebase-token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('tres-en-raya') {
                    bat 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('tres-en-raya') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Test') {
            steps {
                dir('tres-en-raya') {
                    bat 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                dir('tres-en-raya') {
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy to Firebase') {
            steps {
                dir('tres-en-raya') {
                    bat "npx firebase-tools deploy --token %FIREBASE_TOKEN% --only hosting --non-interactive"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Despliegue completado con exito.'
        }
        failure {
            echo 'El pipeline ha fallado. Revisa los logs.'
        }
    }
}
