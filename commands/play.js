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
    execute(interaction) {
        const playSong = async () => {
            const songKeyword = interaction.options.getString("song");
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return videoResult.videos.length > 1
                    ? videoResult.videos[0]
                    : null;
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

            player.on(AudioPlayerStatus.Idle, () => playSong());

            const embed = new MessageEmbed()
                .setTitle("Music Playing: ")
                .setURL(video.url)
                .setAuthor("Your daily dose of propaganda is here")
                .setDescription(video.title + " - " + video.duration)
                .setThumbnail(video.thumbnail)
                .setTimestamp()
                .setFooter("Bot made by Redekian (The most magas)");

            await interaction.channel.send({
                embeds: [embed],
            });
        };
        try {
            playSong();
            interaction.reply("Music has started");
        } catch {
            interaction.reply({
                content:
                    "Oof! Couldn't play this song! Please play another one or try again later.",
                ephmeral: true,
            });
        }
    },
};
