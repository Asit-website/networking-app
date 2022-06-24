const Users = require("../models/userModal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  register: async (req, res) => {
    try {
      const {fullname, username, email, password, gender} = req.body;
      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name)
        return res.status(400).json({ msg: "This Username is Already Exists" });

      const user_email = await Users.findOne({ email: email });
      if (user_email)
        return res.status(400).json({ msg: "This Email is Alredy exists" });

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "password length is atleast 6 character" });
      }

      const passwordHash = await bcrypt.hash(password,12)

    //   console.log(passwordHash);

    const newUser = new Users({
        fullname,
        username:newUserName,
        email,
        password:passwordHash,
        gender

    })


    //create jsonwebtoken for user
    const access_token = createAccessToken({id:newUser._id})
    const refresh_token = createRefreshToken({id:newUser._id})

    // set The cookie
    res.cookie('refreshtoken',refresh_token, {
      httpOnly:true,
      path:'/api/refresh_token',
      maxAge:30*7*24*60*60*1000
    })

       await newUser.save();

      //user save hote hai sare ke sare newuser ke document a jaye than ...newuser use kro
      // kuyki is bar hm user ko hi update krne wale hai 
      res.json({ msg: "Register Success!",
      access_token,
      user:{
        ...newUser._doc,
           password: ''
      }
    
     });

    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  login: async (req, res) => {
    try {
       const {email,password} = req.body
       // populate is for refrence documents in other collections
       const user = await Users.findOne({email})
        .populate("followers following", "avatar username fullname followers following")
         if(!user) return res.status(400).json({msg:"This Email Does Not Exist"})

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) return res.status(400).json({msg:"password is incorrect"})

        //create jsonwebtoken for user
       const access_token = createAccessToken({id:user._id})
       const refresh_token = createRefreshToken({id:user._id})

    // set The cookie
      res.cookie('refreshtoken',refresh_token, {
      httpOnly:true,
      path:'/api/refresh_token',
      maxAge:30*7*24*60*60*1000
    })

       // kuyki is bar hm user ko hi update krne wale hai 
       res.json({ msg: "Login Success!",
       access_token,
       user:{
         ...user._doc,
         password: ''
       }
     
      });
 
    } 
    
    catch (error) {
      return res.status(500).json({ msg: error.message });
    }

  },

  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', {path:'/api/refresh_token'})
      return res.json({msg:"Logged out!"})
    }
    
    catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  generateAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
          // refrence object ko lene ke liye apan populate ka use krte hai
      if(!rf_token) return res.status(400).json({msg:"Please Login Now."})
// refrence document in other collections
      jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET, async(err,result)=>{
          if(err) return res.status(400).json({msg:"Please Login"})

          const user = await Users.findById(result.id).select("-password")
          .populate('followers following', 'avatar username fullname followers following')

          if(!user) return res.status(400).json({msg:"This Does Not Exist"})

          const access_token = createAccessToken({id: result.id})

          res.json({
            access_token,
            user
          })
          
      })
     
    } 
    
    catch (error) {

      return res.status(500).json({ msg: error.message });
    }
  },
};

const createAccessToken = (Payload)=>{
 return jwt.sign(Payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
}

const createRefreshToken = (Payload)=>{
 return jwt.sign(Payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'30d'})
}



module.exports = authCtrl
