import { Telegraf, Markup, session } from "telegraf";
import { Scenes } from "telegraf";
import dotenv from 'dotenv';
import procces from 'process';
import mongoose from 'mongoose';
import { buttons } from "./keyboard/buttons.js";
import { Action } from "./constants/actions.js";
import './models/user.model.js';
import './models/order.model.js';
import './models/products.model.js';
import loginScene from './controllers/login.controller.js'
import orderScene from './controllers/order.controller.js';
import sendOrdersScene from './controllers/sendOrders.controller.js'
import moment from "moment";

dotenv.config();

mongoose.connect(procces.env.DB_URL, {})
    .then(() => console.log('MongoDB connected :)'))
    .catch((err) => console.log(err));

const User = mongoose.model('user');
const Order = mongoose.model('order');
const Product = mongoose.model('product');
const bot = new Telegraf(procces.env.BOT_TOKEN);

const stage = new Scenes.Stage(
    [
        loginScene,
        orderScene,
        sendOrdersScene
    ]
);

bot.use(session());
bot.use(stage.middleware())

bot.start((ctx) => {
    try {
        if (ctx.chat.type == 'private') {
            ctx.reply(`Здравствуйте, ${ctx.chat.first_name}`, 
            Markup.keyboard(buttons.SET_AUTH)
            .resize()
            );
        } else {
            ctx.reply(`Бот запущен в группе - ${ctx.chat.id}`)
        }
    } catch (e) {
        console.log(e);
    }
});

bot.hears(Action.LOGIN, ctx => {
    ctx.scene.enter('loginScene')
})

bot.hears(Action.BACK, (ctx) => {
    ctx.scene.leave();
    ctx.reply(`Здравствуйте, ${ctx.chat.first_name}`, 
        Markup.keyboard(buttons.SET_AUTH)
        .resize()
        );
})

bot.hears(Action.SEND_ORDER_FOR_SELLERS, ctx => {
    ctx.scene.enter('sendOrdersScene')
})

bot.hears(Action.MAKE_ORDER, ctx => {
    ctx.scene.enter('orderScene')
})

bot.hears(Action.FAQ, async (ctx) => {
    await ctx.replyWithPhoto({url: 'https://sun9-36.userapi.com/impg/u-4a-1vB1cOaiO0FtLJ3l1SvQjfLFYItSxmHiw/x6Joh4eHV4Y.jpg?size=609x471&quality=96&sign=e7553e7be1256d84f6b65a683d18f04f&type=album'});
    await ctx.reply('Команда разработчиков состоит из двух человек\nЕсли увидите ошибки, пишите сюда: help@mail.ru\n\nДанный бот является посредником между покупателем и продавцом\n\n');
})

bot.hears(Action.ORDERS, ctx => {
    ctx.reply('Просматриваю заказы. . .',
    Markup.keyboard(buttons.ORDERS)
    .resize())
})

bot.hears(Action.MAIN_MENU, ctx => {
    ctx.reply('Главное меню',
    Markup.keyboard(buttons.MAIN_MENU)
    .resize())
})

bot.hears(Action.VIEW_ORDERS, async ctx => {
    const user = await User.findOne({chatId: ctx.chat.id})
    await sendOrderByQuery(ctx, ctx.chat.id, {chatId: user.chatId})
})

bot.hears(Action.BUTTON_MAIN_MENU, ctx => {
    ctx.reply('Привет дружище', 
    Markup.keyboard(buttons.MAIN_MENU)
    .resize());
    return ctx.scene.leave()
})

bot.hears(/c/, async ctx => {
    let orderId = ctx.message.text;
    orderId = orderId.substring(2, 5);
    if (ctx.chat.id > 0) {
        sendProductByQuery(ctx, ctx.chat.id, {orderId: orderId})
    }

    if (ctx.chat.id < 0) {
        let html;
        Product.find({orderId: orderId}).then(async product => {
            let count = 0,
            user_id;
            html = product.map ((f, i) => {
                count++;
                user_id = f.chatId
                return `=========================\n 📦Товар: ${f.nameProduct}\n ⚖️Количество: ${f.value}`;
            }).join('\n');

            html += `\n=========================\n\nID клиента: -${user_id}\nID заказа: +${orderId}`

            return await ctx.telegram.sendMessage('-1001756421815', html,
            Markup.inlineKeyboard(
                [
                    [
                        {text: '✔️ Принять', callback_data: '✔️ Принять'}, {text: '❌ Отменить', callback_data: '❌ Отменить'}
                    ],
                    [
                        {text: '📦 Готов к выдаче', callback_data: '📦 Готов к выдаче'}
                    ]
                ]
            ))
        });
    }
})

function sendOrderByQuery(ctx, chatId, query) {
    let html;
    Order.find(query).then(async orders => {
        let count = 0;
        html = orders.map ((f, i) => {
            count++;
            return `=============================\n <b>Заказ #${i + 1}</b>\n <b>✅Статус:</b> ${f.status}\n <b>📅Обновлено:</b> ${moment(f.createdAt).format('DD.MM.YYYY, h:mm')}\n <b>🔎Подробнее:</b> /c${f.orderId}`;
        }).join('\n');

        html += `\n=============================\n\n<b><i>📮Всего заказов:</i></b> ${count}`
        await ctx.replyWithHTML(html)
    });
}

function sendProductByQuery(ctx, chatId, query) {
    let html;
    Product.find(query).then(async product => {
        let count = 0;
        html = product.map ((f, i) => {
            count++;
            return `===================\n <b>📦Товар:</b> ${f.nameProduct}\n <b>⚖️Кол-во:</b> ${f.value}`;
        }).join('\n');

        html += `\n===================\n\n<b><i>🧺Всего товаров:</i></b> ${count}`
        await ctx.replyWithHTML(html)
    });
}

bot.action('✔️ Принять', ctx => {
    const msg = ctx.callbackQuery.message.text
    let user_id = msg.substring(msg.indexOf('-') + 1)
    let order_id = msg.substring(msg.indexOf('+') + 1)
    
    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ принят')
        ctx.telegram.sendMessage(user_id, 'Торговец принял ваш заказ\nОбновляю статус заказов. . .')

        Order.updateMany({orderId: order_id},
            {
                $set: {
                    status: 'В обработке'
                }
            }).then(console.log('upd: status'))
        
        ctx.pinChatMessage(ctx.callbackQuery.message.message_id)

    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.action('❌ Отменить', ctx => {
    const msg = ctx.callbackQuery.message.text
    const user_id = msg.substring(msg.indexOf('-') + 1)

    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ отменён')
        ctx.telegram.sendMessage(user_id, 'Торговец отменил ваш заказ')
    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.action('📦 Готов к выдаче', ctx => {
    const msg = ctx.callbackQuery.message.text
    let user_id = msg.substring(msg.indexOf('-') + 1)
    let order_id = msg.substring(msg.indexOf('+') + 1)
    
    if (ctx.from.id == 258752149) {
        ctx.answerCbQuery('Заказ готов к выдаче')
        ctx.telegram.sendMessage(user_id, 'Торговец готов выдать товар\nОбновляю статус заказов. . .')

        Order.updateMany({orderId: order_id},
            {
                $set: {
                    status: 'Готов к выдаче'
                }
            }).then(console.log('upd: status'))

    } else {
        ctx.answerCbQuery('Ты не торговец', ctx.from.id)
        ctx.reply(`${ctx.from.first_name}, Ты не торговец`)
    }
})

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply(`${ctx.message.text}`));
bot.launch();