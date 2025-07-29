import { convertToObjectIdMongoose } from '../../pkg/utils/index.utils.js';
import RoomModel from '../models/room.model.js';

export const getChatRooms = async (userId) => {
    const rooms = await RoomModel.aggregate([
        {
            $match: {
                'room_members.userId': convertToObjectIdMongoose(userId)
            }
        },
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
                                        cond: { $ne: ['$$member._id', convertToObjectIdMongoose(userId)] }
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
                                    { $eq: ['$event_senderId', convertToObjectIdMongoose(userId)] },
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
