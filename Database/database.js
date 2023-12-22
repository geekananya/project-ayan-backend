require('dotenv').config();
const pgp = require("pg-promise")();
const db = pgp(process.env.POSTGRES_CONNECTION);

// ATTENTION: Never use ES6 template strings or manual concatenation to generate queries, as both can easily result in broken queries! Only this library's formatting engine knows how to properly escape variable values for PostgreSQL.


//an async function ALWAYS returns a promise. So to get the actual value either manually resolve it with then, or log its value as you like.

//login
const getUserhash = async (email)=> {
    try{
        const hash = await db.one('select userid, hashedpassword from credentials where email=$1', [email]);
        return hash;
    }
    catch(err){
        // console.log(err);
        return err;
    }
}   //works

const getUserById = async (id)=>{
    try{
        const user = await db.one('select * from users where userid=$1', [id]);
        return user.user_type;
    }
    catch(err){
        return err.message;
    }
    // getUserById(1).then(console.log);
}   //works



//registration
const addVolunteer = async (name, email, phone, address, gender, occupation) => {
    try{
        const id = await db.one('INSERT INTO users (name, email, phone_no, user_type, address, occupation, gender) VALUES($1, $2, $3, $4, $5, $6, $7) returning userid', [name, email, phone, 'Volunteer', address, occupation, gender]);
        return {id};
    }catch(err){
        // console.log("Invalid details", err);
        return err;
    }
}
const addOrganization = async (name, email, phone, address, cause, instagram, twitter, facebook) => {
    try{
        const id = await db.one('INSERT INTO users (name, email, phone_no, user_type, address, cause, instagram, twitter, facebook) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) returning userid', [name, email, phone, 'Organization', address, cause, instagram || null , twitter, facebook || null]);
        return {id};
    }catch(err){
        console.log("Invalid details", err);
        return err;
    }
}
const addCredential = async (email, hsh)=>{
    try{
        await db.none('insert into credentials (email, hashedpassword) values ($1, $2)', [email, hsh]);
        console.log("inserted successfully");
        // return true;
    }catch(err){
        // console.log("Invalid email or password format", err);
        return err;
    }
    // getUserhash("developer@test.com").then(hash=>console.log(hash));
}

//location
async function updateLocation(id, lat, long){
    const query = `
        INSERT INTO userlocations (userid, longitude, latitude)
        VALUES ($1, $2, $3)
        ON CONFLICT (userid)
        DO UPDATE SET longitude = $2, latitude = $3, last_updated = CURRENT_TIMESTAMP
        RETURNING longitude, latitude;
      `;
      
      try {
          const result = await db.one(query, [id, long, lat]);
          return result;
        } catch (error) {
            throw error;
        }
    }
    
async function addFundraiser(title, goal, description, info, link){
    const query = `
        INSERT INTO fundraisers (title, goal, description, disaster_info, links, organisation)
        VALUES ($1, $2, $3, $4, $5, 'RedCross')
        RETURNING id;
    `;
    try{
        const res = await db.one(query, [title, goal, description, info || null, link || null]);
        return res;
    }catch(error){
        throw error;
    }
}

module.exports = {
    addVolunteer, addOrganization,
    addCredential,
    getUserhash,
    getUserById,
    updateLocation,
    addFundraiser
}


addFundraiser('random', '2033032', 'for me', '', 'shkjak').then(console.log).catch(console.log);
    // db.one('SELECT email from credentials where userid=1')
    //   .then((data) => {
    //     console.log('DATA:', data.email)
    //   })
    //   .catch((error) => {
    //     console.log('ERROR:', error)
    //   })