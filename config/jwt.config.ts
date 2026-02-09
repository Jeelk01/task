export default () => ({
     jwt: {
          secret: process.env.JWT_SECRET || '',
          expiresIn: process.env.JWT_EXPIRES_IN || '1h',

     },
     refreshJwt: {
          secret: process.env.JWT_REFRESH_SECRET || '',
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
     },
     secondaryToken: {
          secret: process.env.JWT_SECONDARY_SECRET,
          expiresIn: process.env.JWT_SECONDARY_EXPIRES_IN || '3d'
     },
     passwordReset: {
          secret: process.env.JWT_PASSWORD_RESET_SECRET || '',
          expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN || '1h'
     }
})   