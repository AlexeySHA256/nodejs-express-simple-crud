import bcrypt from "bcrypt";

export class BcryptHasher {
    saltRounds: number = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.genSalt(this.saltRounds).then((salt) => {
            return bcrypt.hash(password, salt).catch((err) => {
                console.log("Unable to hash password: ", err);
                throw err;
            })
        }).catch((err) => {
            console.log("Unable to generate salt: ", err);
            throw err;
        })
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword).catch((err) => {
            console.log("Unable to compare passwords: ", err);
            throw err;
        })
    }
}