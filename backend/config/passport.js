const passport = require('passport');
const prisma = require('../lib/prisma');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const profissional = await prisma.profissional.findUnique({
      where: { id },
      include: {
        especialidades: {
          include: {
            especialidade: true
          }
        }
      }
    });
    done(null, profissional);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

