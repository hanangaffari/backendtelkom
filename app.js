const express = require('express');
const app = express();

const jwt = require("jsonwebtoken");

var Passport = require('passport').Passport,
    passport = new Passport(),
    guru = new Passport();
const passportJWT = require("passport-jwt");


const Akun = require('./models/Akun');

const Makul = require('./models/mata_kuliah');

const db = require('./config/db');
const bcrypt = require('bcrypt');
const makul = require('./models/mata_kuliah');


let ExtractJWT = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOp = {};

jwtOp.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();

jwtOp.secretOrKey = "telkom";

const getUser = async obj => {
  return await Akun.findOne({
    where:obj
  })  
};

  const getMakul = async obj => {
    return await Makul.findOne({
      where:obj
    })  
  };

  let strategy = new JwtStrategy(jwtOp,(jwt_payload,next) => {
    

    if(jwt_payload.role == 'admin'){
            next(null,true)

    }else{
        next(null,false)
        
    }
})

let dosen = new JwtStrategy(jwtOp,async(jwt_payload,next)=> {
    let per = await getUser({id:jwt_payload.id});

    if(per){
            next(null,true)
    }
    else{
        next(null,false)
        
    }
});

function gety(){
    return Makul.findAll({});

}

guru.use(dosen);

passport.use(strategy)


app.use(express.urlencoded({extended : true}));

db.authenticate().then(() => {
    console.log("berhasil konek ke database")
});

app.get('/',(req,res) => {

    gety().then(result => {
         cok = result;

         res.json({
        mesg:cok
        })
    })

   

});
//sign up

app.post('/daftar',async (req,res) => {

        let {nama,nip, mata_kuliah,username,password,role,jadwal} = req.body;
        
    nama = nama.trim();
    nip = nip;
    mata_kuliah = mata_kuliah.trim();
    username = username.trim();
    password = password.trim();
    role= "dosen";
    jadwal="belom ada jadwal";
    
    if(nama == "" || nip == "" || mata_kuliah == "" || username == "" || password == ""){
        res.json({
            status:"FAILED",
            message:"Empty input fields!"
        });

        }else{            
            userlow = username.toLowerCase();
            if(username !== userlow){
                res.json({
                    status:"FAILED",
                    message:"username harus huruf kecil semua"
                }); 
            }

        else if(password.length < 8){
            res.json({
                status:"FAILED",
                message:"password minimal 8 huruf"
            });
        }else if(!/^(?=.*[a-z]).*$/.test(password)){
            res.json({
                status:"FAILED",
                message:"password Harus mengandung setidaknya satu karakter huruf kecil"
            });
        }
        else if(!/^(?=.*[A-Z]).*$/.test(password)){
            res.json({
                status:"FAILED",
                message:"password Harus mengandung setidaknya satu karakter huruf besar"
            });
        }else if(!/\d/.test(password)){
            res.json({
                status:"FAILED",
                message:"password Harus mengandung setidaknya satu angka"
            });
        }else if(!/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test(password)){
            res.json({
                status:"FAILED",
                message:"password Harus mengandung setidaknya satu karakter spesial"
            });
        }
        else{
            
         let user = await getUser( {nip:nip} )
         let matakul = await getMakul({mata_kuliah:mata_kuliah});
        
            if(user){
                res.json({
                    status:"FAILED",
                    message:"pengguna sudah ada"
                })
            }else if(!matakul){
                res.json({
                    status:"FAILED",
                    message:"mata kuliah tidak ada"
                })
            } else{
                await getMakul({mata_kuliah:mata_kuliah}).then(async(result) =>{
                    if(result.dosen == ""){
                        await Makul.update(
                            
                            {dosen:""+username},
                            {where: {mata_kuliah:mata_kuliah} }
                            )    
                    }else{
                    await Makul.update(
                            
                        {dosen:result.dosen+","+username},
                        {where: {mata_kuliah:mata_kuliah} }
                        )                   
                    }                    
                })
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword => {
                    const newAkun = new Akun({
                        nama,
                        nip,
                        mata_kuliah,
                        username,
                        password: hashedPassword,
                        role,
                        jadwal
                    });
                    newAkun.save().then(result => {
                        res.json({
                            status:"SUCCESS",                            
                            data:result,
                        })
                    })
                }).catch(err => {
                    res.json({
                        status:"FAILED",
                message:"invalid password"
                    })
                })
                .catch(err => {
                    res.json({
                        status:"FAILED",
                message:"error user account"
                    })
                })
            }
       
    }
  
}
})

app.post('/daftarsebagaiadmin',async (req,res) => {

    let {nama,nip, mata_kuliah,username,password,role,jadwal} = req.body;
    
nama = "none";
nip = "none";
mata_kuliah = "none";
username = username.trim();
password = password.trim();
role= "admin";
jadwal="none";

if(username == "" || password == ""){
    res.json({
        status:"FAILED",
        message:"Empty input fields!"
    });

    }else{            

        if(username == !username.toLowerCase()){
            res.json({
                status:"FAILED",
                message:"username huruf kecil semua"
            }); 
        }

    else if(password.length < 8){
        res.json({
            status:"FAILED",
            message:"password minimal 8 huruf"
        });
    }else if(!/^(?=.*[a-z]).*$/.test(password)){
        res.json({
            status:"FAILED",
            message:"password Harus mengandung setidaknya satu karakter huruf kecil"
        });
    }
    else if(!/^(?=.*[A-Z]).*$/.test(password)){
        res.json({
            status:"FAILED",
            message:"password Harus mengandung setidaknya satu karakter huruf besar"
        });
    }else if(!/\d/.test(password)){
        res.json({
            status:"FAILED",
            message:"password Harus mengandung setidaknya satu angka"
        });
    }else if(!/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test(password)){
        res.json({
            status:"FAILED",
            message:"password Harus mengandung setidaknya satu karakter spesial"
        });
    }
    else{
        
     let user = await getUser( {nip:nip} )
     
    
        if(user){
            res.json({
                status:"FAILED",
                message:"pengguna sudah ada"
            })
        } else{
            const saltRounds = 10;
            bcrypt.hash(password,saltRounds).then(hashedPassword => {
                const newAkun = new Akun({
                    nama,
                    nip,
                    mata_kuliah,
                    username,
                    password: hashedPassword,
                    role,
                    jadwal
                });
                newAkun.save().then(result => {
                    res.json({
                        status:"SUCCESS",
                        message:"success",
                        data:result,
                    })
                })
            }).catch(err => {
                res.json({
                    status:"FAILED",
            message:"invalid password vruh"
                })
            })
            .catch(err => {
                res.json({
                    status:"FAILED",
            message:"error user account"
                })
            })
        }
   
}

}
})


app.post('/login',async (req,res) => {
    let {username,password} = req.body;
    username = username.trim();
    password = password.trim();
    const user = req.body.username;

    if (username == "" || password == ""){
        res.json({
            status:"FAILED",
            message:"empty creden"
        })
    }else{

        let user = await getUser( {username:username} )
            if(user){
                const hashedPassword = user.password;
                bcrypt
                .compare(password,hashedPassword)
                .then((result) => {
                    if(result){
                        let payload = {role:user.role,id:user.id}

                        let token = jwt.sign(payload, jwtOp.secretOrKey)
                        res.json({
                            status:"SUCCESS",
                            message:"signin successful",
                            token:token,
                            data: user,
                        });
                    }else{
                        res.json({
                            status:"FAILED",
                            message:"kata sandi yang dimasukkan tidak valid",                            
                        });
                    }
                })
                .catch((err) => {
                    res.json({
                        status:"FAILED",
                        message:"error happened",
                        
                    })
                })
            }else if(!user){
                res.status(401).json({message:"username salah atau anda belom buat akun"});
            }
            else{
                res.json({
                    status:"FAILED",
                    message:"kredensial yang dimasukkan tidak valid",                            
                });
            }
       
    }
})
app.get("/matakuliah",guru.authenticate("jwt",{session:false}),async(req,res) => {
    let {id} = req.body;

    if(id !== ""){
        getMakul({id:id}).then(async(result)=> {
             //let us = await Akun.findOne({where:{mata_kuliah:"bisnis"}});             
                //id
                let id = result.id;
                //nama matakuliah
                let mata_kuliah =  result.mata_kuliah;
                //mahasiswa
                let textmaha = result.mahasiswa;
                let mahasiswa = textmaha.split(',');
                //dosen
                let textdosen = result.dosen
                let dosen = textdosen.split(',');
                //jadwal
                let textjadwal = result.jadwal;
    
                    let jadwalsplit = textjadwal.split('|');
    
                    let senint = jadwalsplit[0];
                    let senin= senint.split(',');
    
                    
                    let selasat = jadwalsplit[1];
                    let selasa= selasat.split(',');
    
                    let rabut = jadwalsplit[2];
                    let rabu= rabut.split(',');
    
                    let kamist = jadwalsplit[3];
                    let kamis = kamist.split(',');
    
                    let jumatt = jadwalsplit[4];
                    let jumat = jumatt.split(',');
    
                    let sabtut = jadwalsplit[5];
                    let sabtu = sabtut.split(',');
    
                    let minggut = jadwalsplit[6];
                    let minggu = minggut.split(',');
    
                result = {us,id,mata_kuliah,mahasiswa,dosen,jadwal:{senin,selasa,rabu,kamis,jumat,sabtu,minggu}};
                
              
              
                
              res.status(200).json({
                status:"Sukses",
                message:result

            });
            
        }).catch(err => {
            res.status(500).json({
                status:"gagal",            
            });
        })
        
    }else{
        Makul.findAll().then(result => {
        
            for (let index = 0; index < result.length; index++) {
                //id
                let id = result[index].id;
                //nama matakuliah
                let mata_kuliah =  result[index].mata_kuliah;
                //mahasiswa
                let textmaha = result[index].mahasiswa;
                let mahasiswa = textmaha.split(',');
                //dosen
                let textdosen = result[index].dosen
                let dosen = textdosen.split(',');
                //jadwal
                let textjadwal = result[index].jadwal;
    
                    let jadwalsplit = textjadwal.split('|');
    
                    let senint = jadwalsplit[0];
                    let senin= senint.split(',');
    
                    
                    let selasat = jadwalsplit[1];
                    let selasa= selasat.split(',');
    
                    let rabut = jadwalsplit[2];
                    let rabu= rabut.split(',');
    
                    let kamist = jadwalsplit[3];
                    let kamis = kamist.split(',');
    
                    let jumatt = jadwalsplit[4];
                    let jumat = jumatt.split(',');
    
                    let sabtut = jadwalsplit[5];
                    let sabtu = sabtut.split(',');
    
                    let minggut = jadwalsplit[6];
                    let minggu = minggut.split(',');
    
                result[index] = {id,mata_kuliah,mahasiswa,dosen,jadwal:{senin,selasa,rabu,kamis,jumat,sabtu,minggu}};
                
              }
              
              
              res.status(200).json({
                status:"Sukses",
                message:result,            
                
            });
        }).catch(err => {
            res.status(500).json({
                status:"gagal",            
            });
        })
    }

    
});

app.post("/matakuliah", passport.authenticate("jwt",{session:false}),async (req,res) => {
    let {mata_kuliah,mahasiswa,dosen,jadwal} = req.body;
        
    mata_kuliah = mata_kuliah.trim();
    mahasiswa = mahasiswa.trim();
    dosen = dosen.trim();
    jadwal= jadwal.trim();

    if(mata_kuliah == "" || mahasiswa == "" ){
        res.json({
            status:"FAILED",
            message:"Empty input fields!"
        });
        }else{
        let makul = await getMakul( {mata_kuliah:mata_kuliah} );

        if(makul){
            res.json({
                status:"FAILED",
                message:"mata kuliah sudah ada"
            }); 
        }else{
            const newMakul = new Makul({
                mata_kuliah,
                mahasiswa,
                dosen,
                jadwal,                
            });

           

            newMakul.save().then(async(result) => {
                
                let mata_kuliah = "("+result.id+")"+result.mata_kuliah;
                //dosen
                let textdosen = result.dosen
                let dosen = textdosen.split(',');
                //jadwal
         
                let textjadwal = result.jadwal;
                let jadwalsplit = textjadwal.split('|');



                let senint = jadwalsplit[0];
                let senin= senint.split(',');
                
                let selasat = jadwalsplit[1];
                let selasa= selasat.split(',');

                let rabut = jadwalsplit[2];
                let rabu= rabut.split(',');

                let kamist = jadwalsplit[3];
                let kamis = kamist.split(',');

                let jumatt = jadwalsplit[4];
                let jumat = jumatt.split(',');

                let sabtut = jadwalsplit[5];
                let sabtu = sabtut.split(',');

                let minggut = jadwalsplit[6];
                let minggu = minggut.split(',');
                //mahasiswa
                let textmaha = result.mahasiswa;
                let mahasiswa = textmaha.split(',');

                 /*
                for (let index = 0; index < dosen.length; index++) {    
                   
                                 
                    if (senin.includes(dosen[index])){
                        
                        await Akun.update(
                            
                         {jadwal:'senin'},
                         {where: {username:dosen[index]} }
                         )                                                                                     
                           
                    }else if(selasa.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'selasa'},
                         {where: {username:dosen[index]} }
                         )  
                    }
                    else if(selasa.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'selasa'},
                         {where: {username:dosen[index]} }
                         )  
                    }
                    else if(rabu.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'rabu'},
                         {where: {username:dosen[index]}}
                         )  
                    }
                    else if(kamis.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'kamis'},
                         {where: {username:dosen[index]}}
                         )  
                    }
                    else if(jumat.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'jumat'},
                         {where: {username:dosen[index]}}
                         )  
                    }else if(sabtu.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'sabtu'},
                         {where: {username:dosen[index]}}
                         )  
                    }
                    else if(minggu.includes(dosen[index])){                        
                        await  Akun.update(
                            
                         {jadwal:'minggu'},
                         {where: {username:dosen[index]}}
                         )  
                    }else{
                        res.json({
                            message: "error happened"
                        })
                    }
                  }
                  */
                  
                  let totaljadwal= {senin,selasa,rabu,kamis,jumat,sabtu,minggu};

                        let hari = ["senin","selasa","rabu","kamis","jumat","sabtu","minggu"];

                        for (let index = 0; index < dosen.length; index++) {    
                            let dozen = dosen[index];                            
                                
                                for (let index = 0; index < hari.length; index++) {                                                                        
                                 if (jadwalsplit[index].includes(dozen)){
                                
                                        await Akun.update(
                                            
                                         {jadwal:hari[index]},
                                         {where: {username:dozen} }
                                         )                                                                                     
                                        

                                    }
                                    else{
                                        res.json({
                                            status:"error"
                                        })
                                    }
                                     
                                }
                                                           
                            
                        }

                res.json({
                    status:"SUCCESS",
                    data:{mata_kuliah,dosen},
                    mahasiswa: mahasiswa,
                    jadwal: totaljadwal,
                })
            }).catch(err => {
                res.json({
                    status:"FAILED",
            message:"error happened"
                })
                
            })
        }
    }
});

app.put("/matakuliah", passport.authenticate("jwt",{session:false}),async (req,res) => {
    
    let {id,mata_kuliah,mahasiswa,dosen,jadwal} = req.body;
    
    id = id.trim();
    mata_kuliah = mata_kuliah.trim();
    mahasiswa = mahasiswa.trim();
    dosen = dosen.trim();
    jadwal= jadwal.trim();

    if(id == ""){
        res.json({
            status:"FAILED",
            message:"id tidak boleh kosong"
        })
    }
    else if(mata_kuliah == "" && mahasiswa == "" && dosen == "" && jadwal == ""){
        res.json({
            status:"FAILED",
            message:"Empty input fields!"
        });
        }else{
            if(mata_kuliah !== ""){
                await Makul.update(
                            
                    {mata_kuliah:mata_kuliah},
                    {where: {id:id} }
                    )
                    
            }
            if(mahasiswa !== ""){
                await Makul.update(
                            
                    {mahasiswa:mahasiswa},
                    {where: {id:id} }
                    )                   
            }
            if(dosen !== ""){
                await Makul.update(
                            
                    {dosen:dosen},
                    {where: {id:id} }
                    )

                    
                    
            }
            if(jadwal !== ""){
                await Makul.update(
                            
                    {jadwal:jadwal},
                    {where: {id:id} }
                    )
                    
            }
                      
            await getMakul({id:id}).then(async(result) => {

                
                    //id
                    let id = result.id;
                    //nama matakuliah
                    let mata_kuliah =  result.mata_kuliah;
                    //mahasiswa
                    let textmaha = result.mahasiswa;
                    let mahasiswa = textmaha.split(',');
                    //dosen
                    let textdosen = result.dosen
                    let dosen = textdosen.split(',');
                    //jadwal
                    let textjadwal = result.jadwal;
        
                        let jadwalsplit = textjadwal.split('|');
        
                        let senint = jadwalsplit[0];
                        let senin= senint.split(',');
        
                        
                        let selasat = jadwalsplit[1];
                        let selasa= selasat.split(',');
        
                        let rabut = jadwalsplit[2];
                        let rabu= rabut.split(',');
        
                        let kamist = jadwalsplit[3];
                        let kamis = kamist.split(',');
        
                        let jumatt = jadwalsplit[4];
                        let jumat = jumatt.split(',');
        
                        let sabtut = jadwalsplit[5];
                        let sabtu = sabtut.split(',');
        
                        let minggut = jadwalsplit[6];
                        let minggu = minggut.split(',');

                        let totaljadwal= {senin,selasa,rabu,kamis,jumat,sabtu,minggu};

                        let hari = ["senin","selasa","rabu","kamis","jumat","sabtu","minggu"];

                        /*                        
                        for (let index = 0; index < dosen.length; index++) {    
                            let dozen = dosen[index];
                            await Akun.update(
                                    
                                {mata_kuliah:mata_kuliah},
                                {where: {username:dosen[index]} }
                                )  

                                
                                for (let index = 0; index < hari.length; index++) {                                                                        
                                 if (jadwalsplit[index].includes(dozen)){
                                
                                        await Akun.update(
                                            
                                         {jadwal:hari[index]},
                                         {where: {username:dozen} }
                                         )                                                                                     
                                        

                                    }
                                    else if (!jadwalsplit.includes(dozen)){
                                
                                        await Akun.update(
                                            
                                         {jadwal:"belom ada jadwal"},
                                         {where: {username:dozen} }
                                         )                                                                                     
                                           
                                    }
                                     
                                }
                                                           
                            
                        }

                        */
                        for (let index = 0; index < dosen.length; index++) {    
                            let dozen = dosen[index];
                            await Akun.update(
                                    
                                {mata_kuliah:mata_kuliah},
                                {where: {username:dosen[index]} }
                                )  

                                /*for (let index = 0; index < hari.length; index++) {                                                                        
                                    if (jadwalsplit[index].includes(dozen)){
                                   
                                           await Akun.update(
                                               
                                            {jadwal:hari[index]},
                                            {where: {username:dozen} }
                                            )                                                                                     
                                           
   
                                       }
                                       else if (!jadwalsplit.includes(dozen)){
                                   
                                           await Akun.update(
                                               
                                            {jadwal:"belom ada jadwal"},
                                            {where: {username:dozen} }
                                            )                                                                                     
                                              
                                       }
                                        
                                   }
                                */
                                
                                for (let index = 0; index < hari.length; index++) {                                                                        
                                 if (jadwalsplit[index].includes(dozen)){
                                
                                        await Akun.update(
                                            
                                         {jadwal:hari[index]},
                                         {where: {username:dozen} }
                                         )                                                                                     
                                        

                                    }
                                    else if (!jadwalsplit.includes(dozen)){
                                
                                        await Akun.update(
                                            
                                         {jadwal:"belom ada jadwal"},
                                         {where: {username:dozen} }
                                         )                                                                                     
                                           
                                    }
                                     
                                }
                                                           
                            
                        }
                        
                    result = {id,mata_kuliah,mahasiswa,dosen,jadwal:totaljadwal};
                    res.status(200).json({
                        status:"Sukses",
                        message:result,            
                        
                    });
                    
                }).catch(err => {
                    res.status(500).json({
                        status:"gagal",            
                    });
                })          
                
            }

            });
           
                  
                  
                 



app.delete("/matakuliah", passport.authenticate("jwt",{session:false}),async (req,res) => {
    let {id} = req.body;
    
    id = id.trim();

    if(id == ""){
        res.json({
            message:"id tidak bisa kosong"
        })
    }else{
        Makul.destroy({where:{id:id}}).then( async(result) =>{
            if(result == ""){
                res.json({
                    message:"mata kuliah tidak di temukan",
                    
                })
            }else{
          
                res.json({
                message:"mata kuliah berhasil di hapus",                
            })
        
        }
            
        })
    }
    });

app.listen(4000,() => {
    console.log("port berjalan ")
});
