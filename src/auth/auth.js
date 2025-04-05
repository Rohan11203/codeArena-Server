import jwt from 'jsonwebtoken';

export function  Userauth(req,res,next) {
  const token = req.cookies.token;

  console.log("This cookies", req.cookies);
  // const token = authHeader.split(" ")[1];
  if(!token){
    console.log("There is no token")
    return res.status(401).json({message : 'Unauthenticated: No token provided'});
  }
  try{
  console.log("Got The cookies");
    const response = jwt.verify(token, process.env.JWT_USER_SECRET); // This  ID based on that you can fetch user data 

  if(response){
    req.userId = response.userId;
    next();
  }
  else{
    
    res.status(401).json({ message: 'unauthorized' });
    return;
  }
    
  }catch(err){
   
    res.status(401).json({ 
      message: 'unauthorized' });
    
  }
}