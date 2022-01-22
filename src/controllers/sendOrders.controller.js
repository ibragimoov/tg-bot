import { Scenes, Markup } from 'telegraf';
import moment from 'moment';
import typeorm from 'typeorm'
import Users from '../models/user.model.js';
import Order from '../models/order.model.js';

const sendOrdersScene = new Scenes.WizardScene('sendOrdersScene',
    async (ctx) => {
        const userRep = typeorm.getMongoRepository(Users, "adelace")
        const orderRep = typeorm.getMongoRepository(Order, "adelace")
        const user = await userRep.findOne({chatId: ctx.from.id})
        let html,
            text = `\n=========================\n\nЗаказчик:   ${user.name}\nID пользователя: -${ctx.chat.id}\n`

        orderRep.find({chatId: ctx.from.id, status: 'Новый'}).then(async orders => {
            let count = 0;
            html = orders.map ((f, i) => {
                count++;
                return `=========================\n Заказ #${i + 1}\n ✅Статус: ${f.status}\n 📅Обновлен: ${moment(f.updatedAt).format('DD.MM.YYYY')}\n 🔎Подробнее: /c${f.orderId}`;
            }).join('\n');

            html += text
            await ctx.telegram.sendMessage('-1001756421815', html,
            // Markup.inlineKeyboard(
            //     [
            //         [
            //             {text: '✔️ Принять', callback_data: '✔️ Принять'}, {text: '❌ Отменить', callback_data: '❌ Отменить'}
            //         ],
            //         [
            //             {text: '📦 Готов к выдаче', callback_data: '📦 Готов к выдаче'}
            //         ]
            //     ]
            // )
            )
        });
    
        return await ctx.scene.leave();
    })

export default sendOrdersScene;