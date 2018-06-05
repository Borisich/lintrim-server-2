import jwt from 'jsonwebtoken';
import models from './models';

const secret = 'samplesecret';

const tokenDuration = 60; //60 сек

class utils {
    static getUniqueString() {

        let time = new Date().getTime().toString();
        let timeString = '';
        for (let i=0; i < time.length; i++){
            timeString += String.fromCharCode(97 + parseInt(time[i]))
        }


        let addRandomText = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 40; i++)
            addRandomText += possible.charAt(Math.floor(Math.random() * possible.length));

        return timeString + addRandomText;
    };

    static checkToken(token) {
        return new Promise((resolve, reject) => {
            if(token){
                jwt.verify(token, secret, (err, decod)=>{
                    if(err){
                        resolve(false)
                    }
                    else{
                        resolve(decod.id)
                    }
                });
            }
            else{
                resolve(false)
            }
        })
    };

    static signToken (payload) {
        delete payload.password;
        delete payload.uniqueString;
        delete payload.createdAt;
        delete payload.updatedAt;
        let extendedPayload = Object.assign({}, payload, {exp: Math.floor(Date.now() / 1000) + tokenDuration, durationSec: tokenDuration});
        return jwt.sign(extendedPayload, secret);
    };

}

export default utils;