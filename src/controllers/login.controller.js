import { Markup, Scenes } from 'telegraf';
import { phoneSchema } from './user.controller.js';
import { buttons } from "../keyboard/buttons.js";
import Users from '../models/user.model.js';
import typeorm from 'typeorm'

const loginScene = new Scenes.WizardScene('loginScene', 
    async (ctx) => {
        ctx.replyWithHTML('Введите номер телефона. . .\nНапример <b><i>+79781234567</i></b>', 
        Markup.keyboard(buttons.BACK)
        .resize());
        return await ctx.wizard.next()
    },
    async (ctx) => {
        ctx.wizard.state.phone = ctx.message.text;
        if (await ctx.wizard.state.phone =='👈 Назад') {
            ctx.reply(`Здравствуйте, ${ctx.chat.first_name}`, 
            Markup.keyboard(buttons.SET_AUTH)
            .resize());
            return ctx.scene.leave()
        }
        if (await phoneSchema.isValid(ctx.wizard.state.phone)) {
            const userRep = typeorm.getMongoRepository(Users, 'adelace')
            await ctx.reply('Анализирую базу данных. . .');
            let phone = ctx.wizard.state.phone
            phone = Number(phone.slice(1, 12))
            await userRep.count({phone: phone}, (err, count) => {
                if (count > 0) {
                    ctx.reply('Доступ к приложению открыт', 
                    Markup.keyboard(buttons.MAIN_MENU)
                    .resize()
                    );
                    return ctx.scene.leave();
                }
                else {
                    userRep.insertOne(
                        {
                        chatId: ctx.from.id, 
                        name: ctx.from.first_name, 
                        phone: phone
                        }
                        ).then(function(){
                        console.log("Data inserted")
                        ctx.reply('Номер телефона зарегистрирован\nОткрываю доступ к приложению. . .',
                        Markup.keyboard(buttons.MAIN_MENU)
                        .resize());
                        ctx.scene.leave();;
                        }).catch(function(error){
                        console.log(error);
                        });
                    // ctx.reply('Номер телефона зарегистрирован\nОткрываю доступ к приложению. . .',
                    // Markup.keyboard(buttons.MAIN_MENU)
                    // .resize());
                    // ctx.scene.leave();
                }
            })
        } else {
            ctx.replyWithHTML('<b>Error</b>: номер телефона записан <i>неправильно</i>')
        }
    }
);
export default loginScene;