import jwt from 'jsonwebtoken';

export function  Userauth(req,res,next) {
  const token = req.cookies.token;
  // const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({message : 'Unauthenticated: No token provided'});
  }
  try{
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