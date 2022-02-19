import { createEmbed } from "../functions/createEmbed";
import { Rawon } from "../../structures/Rawon";
import { Guild, GuildBan, TextChannel, User } from "discord.js";

export class ModerationLogs {
    public constructor(public readonly client: Rawon) {}

    public async handleWarn(options: {
        author: User;
        guild: Guild;
        reason: string | null;
        user: User;
    }): Promise<void> {
        const ch = await this.getCh(options.guild);
        if (!ch) return;

        const embed = createEmbed("warn", i18n.__mf("utils.modlogs.warn", { member: options.user.tag }))
            .addField(i18n.__("commands.moderation.common.reasonString"), options.reason ?? i18n.__("commands.moderation.common.noReasonString"))
            .setFooter({
                text: i18n.__mf("commands.moderation.warn.warnedByString", { author: options.author.tag }),
                iconURL: options.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(options.user.displayAvatarURL({ dynamic: true, size: 2048 }));

        await ch.send({ embeds: [embed] }).catch(() => null);
    }

    public async handleBanAdd(ban: GuildBan): Promise<void> {
        const fetched = await ban.fetch().catch(() => undefined);
        if (!fetched) return;

        const ch = await this.getCh(fetched.guild);
        if (!ch) return;

        await ch.send({
            embeds: [
                createEmbed("info", i18n.__mf("commands.moderation.ban.banSuccess", { user: fetched.user.tag }))
                    .addField(i18n.__("commands.moderation.common.reasonString"), fetched.reason ?? i18n.__("commands.moderation.common.noReasonString"))
                    .setFooter({
                        text: i18n.__mf("commands.moderation.ban.bannedByString", { author: fetched.user.tag }),
                        iconURL: fetched.user.displayAvatarURL({ dynamic: true })
                    })
                    .setThumbnail(fetched.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            ]
        });
    }

    public async handleBanRemove(ban: GuildBan): Promise<void> {
        const fetched = await ban.fetch().catch(() => undefined);
        if (!fetched) return;

        const ch = await this.getCh(fetched.guild);
        if (!ch) return;

        await ch.send({
            embeds: [
                createEmbed("info", i18n.__mf("commands.moderation.unban.ubanSuccess", { user: fetched.user.tag }))
                    .setThumbnail(fetched.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            ]
        });
    }

    private async getCh(guild: Guild): Promise<TextChannel | undefined> {
        let ch: TextChannel | undefined;

        try {
            const id = this.client.data.data?.[guild.id]?.modLog.channel;
            const channel = await guild.channels.fetch(id!).catch(() => undefined);
            if (channel?.type !== "GUILD_TEXT") throw new Error();

            ch = channel;
        } catch {
            ch = undefined;
        }

        return ch;
    }
}