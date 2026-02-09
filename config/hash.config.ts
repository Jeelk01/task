export default () => ({
     hash: {
          pepper: process.env.PASSWORD_PEPPER || '',
          saltRounds: Number(process.env.SALT_ROUNDS || '10'),
     }
})