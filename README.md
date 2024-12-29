### Configure env variables

According to mode:
Rename `.env.prod.example` or `.env.dev.example` as `.env` with proper configurations.

### E-Mail System Setup

For email configuration to work, you need to provide the needed parameters. If you wish to use Gmail (easy for local testing), you need to get the Gmail "App Password" generated by Google. Then you need to make sure EMAIL_FROM value is set to the email address you generated the password for previously, and you should set your EMAIL_PASS key as the App Password you generated.

### Install dependencies

npm i

### Run dev server with hot reload

npm run dev

### Test endpoint

/test directory includes postman endpoint test
