// Importing
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Joins a VC and plays a certain song")
        .addStringOption((option) =>
            option
                .setName("song")
                .setDescription("The name of the song you want to play")
                .setRequired(true)
        ),
    async execute(interaction) {
        const songKeyword = interaction.options.getString("song");
        const videoFinder = async (query) => {
            const videoResult = await ytSearch(query);
            return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const video = await videoFinder(songKeyword);
        const stream = ytdl(video.url, {
            filter: "audioonly",
            highWaterMark: 1 << 25,
        });
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });

        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        const embed = new MessageEmbed()
            .setTitle("Music Started Playing")
            .setURL(video.url)
            .setAuthor("The Overseer Bot")
            .setDescription(video.title)
            .setThumbnail(video.thumbnail)
            .setTimestamp()
            .setFooter("Bot made by Redekian (The most magas)");

        await interaction.reply({
            embeds: [embed],
        });
    },
};
