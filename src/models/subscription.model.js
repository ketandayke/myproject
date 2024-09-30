import mongoose,{Schema} from "mongoose"


const subscriptionSchema = new Schema(
    {
        subscribers:{
            type:Schema.Types.ObjectId, //one who is subscribing
            ref :"User"

        },
        
        channels:{
            type:Schema.Types.ObjectId,//one to whow subscriber is "subscribing"
            ref :"User"

        },
        
    },
    {timestamps:true}
    );

export const Subscription = mongoose.model("Subscription",subscriptionSchema)