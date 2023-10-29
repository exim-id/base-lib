import {mongoose} from './deps.ts'
import {mongooseConnection,mongoosePaginate} from './src/db.ts'

const User=mongoose.model('users',new mongoose.Schema({username:String,password:String,name:String}))

await mongooseConnection(async _=>{

 await User.insertMany([{username:'AR',password:'12345678',name:'Achmad Rifai'}])

 const ids=(await User.find({},{},{}).populate('').select('_id')).map(v=>v._id)
 console.log('Ids',ids)
 console.log('Type Ids',typeof ids)
 const users=await User.find({_id:{$in:ids}})
 console.log('Users',users)
})

const users=await mongoosePaginate('10','1',async _=>{
 return (await User.find({},{},{}).populate('').select('_id')).map(v=>v._id)
},async(ids,_)=>{
 return await User.find({_id:{$in:ids}})
})
console.log('User paginated',users)