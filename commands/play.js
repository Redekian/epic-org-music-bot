const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
    joinVoiceChannel,
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource,
    StreamType,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const { guildId } = require("../config.json");

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
            console.log(videoResult);
            return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };
        const connection = joinVoiceChannel({
            channelId: "836217268685504552",
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const video = await videoFinder(songKeyword);
        console.log(video);
        const stream = ytdl(video.url, {
            filter: "audioonly",
        });
        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
        });
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => connection.destroy());
        await interaction.reply({
            content: video.title,
        });
    },
};
