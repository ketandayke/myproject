import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        videoFile:{
            type:String ,//cloudinary url
            required:true,
        },
        thumbnail:{
            type:String ,//cloudinary url
            required:true,
        },
        description:{
            type:String ,
            required:true,
        },
        title:{
            type:String,
            requird:true,
        },
        duration:{
            type:Number,
            default:0
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true

        }


    },
    {timestamps:true}
    )


    videoSchema.plugin(aggregatePaginate);

    export const Video = mongoose.model("Video",videoSchema);