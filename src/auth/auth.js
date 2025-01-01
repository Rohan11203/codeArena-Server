import jwt from 'jsonwebtoken';

export function  Userauth(req,res,next) {
  const authHeader = req.headers.authorization;
  // const token = authHeader.split(" ")[1];
  try{
    const response = jwt.verify(authHeader, process.env.JWT_USER_SECRET); // This returns the user email and ID 

  if(response){
    req.userId = response.userId;
    next();
  }
  else{
    res.status(401).json({ message: 'unauthorized' });
    return;
  }
    
  }catch(err){
    res.status(401).json({ message: 'unauthorized' });
    return;
  }
}