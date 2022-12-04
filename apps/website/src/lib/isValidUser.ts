import { readFileSync } from 'fs';

const users = JSON.parse(readFileSync('users.json').toString());
export default async function isValidUser(
  email: string,
  password: string
): Promise<boolean> {
  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );
  return !!user;
}
