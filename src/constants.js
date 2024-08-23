const DB_Name = "Consultancy"
const accessTokenAge = 15*24 * 60 * 60 * 1000;
const refreshTokenAge = 30 * 24 * 60 * 60 * 1000;

const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: accessTokenAge ,
};
const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: refreshTokenAge,
};


export {
    DB_Name,
    accessTokenAge,
    refreshTokenAge,
    accessTokenOptions,
    refreshTokenOptions,
}
