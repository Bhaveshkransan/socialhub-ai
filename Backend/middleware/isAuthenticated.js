import jwt from 'jsonwebtoken'

const isAuthenticated = async (req,res,next) =>{
   try{
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token){
      return res.status(401).json({
        message:"User Not Authenticated",
       success:false
      })
    }
    //BASICALLY verify karo jo token mila hai vo sahi bhi hai yaa nahi

    const decode = await jwt.verify(token, process.env.SECRET_KEY)
    if(!decode){
        return res.status(401).json({
            message:"Invalid",
            success:false
        })
    }
    req.id =decode.userId;
    next()
   }
   catch(error){
    console.log(error)
    return res.status(401).json({ message: "Invalid or expired token", success: false });
   }
}

export { isAuthenticated }