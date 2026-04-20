import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function authorizeUser(req,res,next){
    const header=req.header("Authorization")

    if(header != null){
        const token=header.replace("Bearer ","")

        jwt.verify(token,process.env.SECRET_KEY,
            (err,decoded)=>{
                if (err || decoded==null){
                    return res.status(401).json(
                        {
                            message:"Unauthorized access. Invalid or expired token."
                        }
                    )
                }else{
                    req.User=decoded
                    next();
                }
            }
             
        )
    }else{
        return res.status(401).json(
            {
                message:"Unauthorized access. Login is required."
            }
        )
    }
}

export function optionalAuth(req,res,next){
    const header=req.header("Authorization")

    if(header != null){
        const token=header.replace("Bearer ","")

        jwt.verify(token,process.env.SECRET_KEY,
            (err,decoded)=>{
                if (!err && decoded!=null){
                    req.User=decoded
                }
                next();
            }
        )
    }else{
        next();
    }
}
   