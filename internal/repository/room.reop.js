import { convertToObjectIdMongoose } from '../../pkg/utils/index.utils.js';
import RoomModel from '../models/room.model.js';

// export const getChatRooms = async (userId) => {
//     const rooms = await RoomModel.aggregate([
//         {
//             $match: {
//                 'room_members.userId': convertToObjectIdMongoose(userId)
//             }
//         },
//         {
//             $lookup: {
//                 from: 'messages',
//                 localField: 'room_last_messages',
//                 foreignField: '_id',
//                 as: 'last_message'
//             }
//         },
//         {
//             $unwind: {
//                 path: '$last_message',
//                 preserveNullAndEmptyArrays: true
//             }
//         },
//         {
//             $lookup: {
//                 from: 'users',
//                 localField: 'room_members.userId',
//                 foreignField: '_id',
//                 as: 'members'
//             }
//         },
//         {
//             $addFields: {
//                 display: {
//                     $cond: [
//                         { $eq: ['$room_type', 'private'] },
//                         {
//                             $arrayElemAt: [
//                                 {
//                                     $filter: {
//                                         input: '$members',
//                                         as: 'member',
//                                         cond: { $ne: ['$$member._id', convertToObjectIdMongoose(userId)] }
//                                     }
//                                 },
//                                 0
//                             ]
//                         },
//                         {
//                             room_name: '$room_name',
//                             avatars: {
//                                 $slice: ['$members.usr_avatar', 4]
//                             }
//                         }
//                     ]
//                 }
//             }
//         },
//         {
//             $sort: {
//                 'last_message.createdAt': -1
//             }
//         },
//         {
//             $project: {
//                 room_id: 1,
//                 room_type: 1,
//                 last_message: {
//                     msg_content: 1,
//                     createdAt: 1
//                 },
//                 display_name: {
//                     $cond: [
//                         { $eq: ['$room_type', 'private'] },
//                         '$display.usr_fullname',
//                         '$display.room_name'
//                     ]
//                 },
//                 display_avatar: {
//                     $cond: [
//                         { $eq: ['$room_type', 'private'] },
//                         '$display.usr_avatar',
//                         '$display.avatars'
//                     ]
//                 }
//             }
//         },
//         {
//             $lookup: {
//                 from: 'messageevents',
//                 let: {
//                     lastMsgId: '$room_last_messages',
//                     roomId: '$_id'
//                 },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     { $eq: ['$event_msgId', '$$lastMsgId'] },
//                                     { $eq: ['$event_senderId', convertToObjectIdMongoose(userId)] },
//                                     { $eq: ['$event_type', 'readed'] }
//                                 ]
//                             }
//                         }
//                     }
//                 ],
//                 as: 'read_status'
//             }
//         },
//         {
//             $addFields: {
//                 is_read: {
//                     $gt: [{ $size: '$read_status' }, 0]
//                 }
//             }
//         }

//     ]);

//     return rooms;
// };
export const getChatRooms = async (userId) => {
    const objectId = convertToObjectIdMongoose(userId);

    const rooms = await RoomModel.aggregate([
        // PHẦN 1: các phòng user còn trong room_members
        {
            $match: {
                'room_members.userId': objectId
            }
        },

        // PHẦN 2: union thêm các phòng user từng gửi hoặc đọc tin nhắn
        {
            $unionWith: {
                coll: 'rooms',
                pipeline: [
                    {
                        $lookup: {
                            from: 'messages',
                            let: { uid: objectId },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$msg_sender', '$$uid'] }
                                    }
                                }
                            ],
                            as: 'sent_msgs'
                        }
                    },
                    {
                        $match: {
                            'sent_msgs.0': { $exists: true }
                        }
                    }
                ]
            }
        },

        // Loại bỏ phòng trùng
        {
            $group: {
                _id: '$_id',
                doc: { $first: '$$ROOT' }
            }
        },
        {
            $replaceRoot: { newRoot: '$doc' }
        },

        // Các bước còn lại giữ nguyên như bạn đang làm:
        {
            $lookup: {
                from: 'messages',
                localField: 'room_last_messages',
                foreignField: '_id',
                as: 'last_message'
            }
        },
        {
            $unwind: {
                path: '$last_message',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'room_members.userId',
                foreignField: '_id',
                as: 'members'
            }
        },
        {
            $addFields: {
                display: {
                    $cond: [
                        { $eq: ['$room_type', 'private'] },
                        {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: '$members',
                                        as: 'member',
                                        cond: { $ne: ['$$member._id', objectId] }
                                    }
                                },
                                0
                            ]
                        },
                        {
                            room_name: '$room_name',
                            avatars: {
                                $slice: ['$members.usr_avatar', 4]
                            }
                        }
                    ]
                }
            }
        },
        {
            $sort: {
                'last_message.createdAt': -1
            }
        },
        {
            $project: {
                room_id: 1,
                room_type: 1,
                last_message: {
                    msg_content: 1,
                    createdAt: 1
                },
                display_name: {
                    $cond: [
                        { $eq: ['$room_type', 'private'] },
                        '$display.usr_fullname',
                        '$display.room_name'
                    ]
                },
                display_avatar: {
                    $cond: [
                        { $eq: ['$room_type', 'private'] },
                        '$display.usr_avatar',
                        '$display.avatars'
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'messageevents',
                let: {
                    lastMsgId: '$room_last_messages',
                    roomId: '$_id'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$event_msgId', '$$lastMsgId'] },
                                    { $eq: ['$event_senderId', objectId] },
                                    { $eq: ['$event_type', 'readed'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'read_status'
            }
        },
        {
            $addFields: {
                is_read: {
                    $gt: [{ $size: '$read_status' }, 0]
                }
            }
        }
    ]);

    return rooms;
};
