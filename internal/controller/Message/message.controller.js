

export const GetRoomChats= async (req,res)=>{
    new SuccessReponse({
        message: "Get list rooms successfully",
        metadata: await getListRooms(req.decoded.userId)
        


    }).send(res)
}