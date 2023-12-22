const bcrypt = require("bcrypt-nodejs");
const { addVolunteer, addOrganization, addCredential, getUserhash, getUserById } = require("../Database/database");
//May have to update to bcrypt or bcrypt-js

const registerUser = (req, res)=>{
    const {name, email, phone, password, address} = req.body;
    const {usertype} = req.query;
    if(name && email && phone && password){
        //validate input
        //hash the password
        bcrypt.hash(password, null, null, async (err, hsh)=>{
            try{
                //store in DB
                let result = 0;
                if(usertype === 'volunteer')
                {
                    const {gender, occupation} = req.body;
                    result = await addVolunteer(name, email, phone, address, gender, occupation);
                }
                else{
                    const {cause, instagram, twitter, facebook} = req.body;
                    result = await addOrganization(name, email, phone, address, cause, instagram, twitter, facebook)
                }
                if(!result.id){
                    res.status(400).json(result.detail);
                }
                const fail = await addCredential(email, hsh);
                if(fail){
                    res.status(400).json(fail.detail);
                }
                res.status(200).send("Successfully registered!");
            }catch{
                res.status(400);
                console.log(err);
            }
        });
        //create session/login
    }
}

const verifyLogin = async (req, res)=>{
    const {email, password} = req.body;
    try{
        const {userid, hashedpassword} = await getUserhash(email);
        if(!userid){
            console.log("Wrong email");
            return res.status(400).json("Invalid Credentials");
        }
        bcrypt.compare(password, hashedpassword, async function(err, match) {
            // res == true
            if(!match){
                console.log("Wrong pass");
                return res.status(400).json("Invalid Credentials");;
            }
            const type = await getUserById(userid);
            // req.session.isAuth = true;
            // req.session.userid = userid;
            // req.session.save(() => {
            //     console.log("Login session - ", req.sessionID);
            // });
            return res.status(200).json({userid, type});
        });
    }catch(err){
        console.log(err);
    }
}


module.exports = {
    registerUser,
    verifyLogin
}