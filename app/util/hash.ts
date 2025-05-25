import bcrypt from "bcrypt";

const saltRounds = 10;

function generateHash(plain: string): string {
  return bcrypt.hashSync(plain, saltRounds);
}
function compareHash(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export { compareHash, generateHash };
