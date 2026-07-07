pipeline {
  agent any

  environment {
    PORT = credentials('PORT')
    SERVER_NODE = credentials('SERVER_NODE')
    UID = credentials('UID')
    PASSWORD = credentials('PASSWORD')
    NAME_DATABASE = credentials('NAME_DATABASE')
    MAIL_HOST= credentials('MAIL_HOST')
    MAIL_PORT= credentials('MAIL_PORT')
    MAIL_USER= credentials('MAIL_USER')
    MAIL_PASS= credentials('MAIL_PASSWORD')
    DATABASE_URL = credentials('POSTGRESQL_URL')
    FRONT_URL = credentials('FRONT_URL')
    MINIO_ENDPOINT= credentials('MINIO_ENDPOINT')
    MINIO_PORT= credentials('MINIO_PORT')
    MINIO_ACCESS_KEY= credentials('MINIO_ACCESS_KEY')
    MINIO_SECRET_KEY= credentials('MINIO_SECRET_KEY')
    MINIO_BUCKET_NAME= credentials('MINIO_BUCKET_NAME')
    MINIO_USE_SSL= credentials('MINIO_USE_SSL')
    JWT_SECRET= credentials('JWT_SECRET')
    TOKEN_NAME= credentials('TOKEN_NAME')
    URL_API = credentials('URL_API')
    NEXT_PUBLIC_URL_API = credentials('NEXT_PUBLIC_URL_API')
    N8N_WEBHOOK_EVALUATION_PT = credentials('N8N_WEBHOOK_EVALUATION_PT')
    DATABASE_URL_PRODUCTION = credentials("DATABASE_URL_PRODUCTION")
  }

  tools {
    nodejs 'Node24' // nombre que definiremos en Jenkins (Node.js 22)
  }

  stages {
    stage('Cleanup pm2') {
      steps {
        sh '''
          pm2 delete back-quality || true
          pm2 delete front-quality || true
        '''
      }
    }

    stage('Cleanup Workspace') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout') {
      steps {
        git branch: 'master',
          credentialsId: 'github-credentials',
          url: 'https://github.com/promo2024/quality.git'
      }
    }

    stage('Install dependencies') {
      steps {
        sh '''
          npm install -g pnpm
          npm install -g pm2
        '''
      }
    }

    stage('Backend Build') {
      steps {
        dir('back-nest') {
          sh '''
            pnpm install
            pnpm prisma generate
            pnpm run build

            cat > .env <<EOF
            MINIO_ENDPOINT=${MINIO_ENDPOINT}
            MINIO_PORT=${MINIO_PORT}
            MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
            MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
            MINIO_BUCKET_NAME=${MINIO_BUCKET_NAME}
            MINIO_USE_SSL=${MINIO_USE_SSL}
            PORT=${PORT}
            DATABASE_URL=${DATABASE_URL}
            DATABASE_URL_PRODUCTION=${DATABASE_URL_PRODUCTION}
            SERVER_NODE=${SERVER_NODE}
            UID=${UID}
            PASSWORD=${PASSWORD}
            NAME_DATABASE=${NAME_DATABASE}
            JWT_SECRET=${JWT_SECRET}
            TOKEN_NAME=${TOKEN_NAME}
            URL_API=${URL_API}
            FRONT_URL=${FRONT_URL}
            N8N_WEBHOOK_EVALUATION_PT=${N8N_WEBHOOK_EVALUATION_PT}
            EOF
          '''
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('front-next') {
          sh '''
            pnpm install

            NEXT_PUBLIC_URL_API=${NEXT_PUBLIC_URL_API} pnpm run build
          '''
        }
      }
    }

    stage('Deploy Backend') {
      steps {
        dir('back-nest') {
          sh '''
            pm2 start ecosystem.config.js --update-env
          '''
        }
      }
    }

    stage('Deploy Frontend') {
      steps {
        dir('front-next') {
          sh '''
            pm2 start ecosystem.config.js --update-env
          '''
        }
      }
    }
  }
}
