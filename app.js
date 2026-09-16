import { supabase } from './supabase.js'
import { initialPlayers } from './data.js'

let players = [...initialPlayers]
// ========================================
// Mリーグドラフト
// ========================================


// ========================================
// データ保存用キー
// ========================================

const STORAGE_KEY = "m-league-draft-data";


// ========================================
// 初期ゲーム名
// ========================================

const DEFAULT_GAME_NAME =
    "Mリーグドラフト";


// ========================================
// 参加者
// ========================================

let participants = [];


// ========================================
// ゲーム名
// ========================================

let gameName =
    DEFAULT_GAME_NAME;


// ========================================
// HTML要素
// ========================================

const nameInput =
    document.getElementById(
        "participantName"
    );

const addButton =
    document.getElementById(
        "addParticipantButton"
    );

const participantList =
    document.getElementById(
        "participantList"
    );

const gameNameInput =
    document.getElementById(
        "gameNameInput"
    );

const saveGameNameButton =
    document.getElementById(
        "saveGameNameButton"
    );

const gameNameDisplay =
    document.getElementById(
        "gameNameDisplay"
    );

const restoreFileInput =
    document.getElementById(
        "restoreFileInput"
    );


// ========================================
// 起動時
// ========================================

loadData();

updateGameNameDisplay();

displayParticipants();


// ========================================
// 参加者追加
// ========================================

addButton.addEventListener(
    "click",
    addParticipant
);


// ========================================
// Enterキーでも参加者追加
// ========================================

nameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addParticipant();

        }

    }
);


// ========================================
// ゲーム名保存
// ========================================

saveGameNameButton.addEventListener(
    "click",
    saveGameName
);


// ========================================
// ゲーム名 Enter保存
// ========================================

gameNameInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            saveGameName();

        }

    }
);


// ========================================
// バックアップ復元
// ========================================

restoreFileInput.addEventListener(
    "change",
    function () {

        const file =
            restoreFileInput.files[0];

        if (!file) {

            return;

        }

        restoreGameData(
            file
        );

    }
);


// ========================================
// データ保存
// ========================================

function saveData() {

    calculateAllTotalScores();


    const data = {

        version: 2,

        gameName:
            gameName,

        participants:
            participants,

        players:
            players

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


// ========================================
// データ読み込み
// ========================================

function loadData() {

    const savedData =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!savedData) {

        return;

    }


    try {

        const data =
            JSON.parse(
                savedData
            );


        // ========================================
        // ゲーム名
        // ========================================

        if (
            typeof data.gameName ===
            "string" &&
            data.gameName.trim() !== ""
        ) {

            gameName =
                data.gameName.trim();

        }


        // ========================================
        // 参加者
        // ========================================

        if (
            data.participants &&
            Array.isArray(
                data.participants
            )
        ) {

            participants =
                data.participants;

        }


        // ========================================
        // 選手ポイント
        // ========================================

        if (
            data.players &&
            Array.isArray(
                data.players
            )
        ) {

            data.players.forEach(
                (savedPlayer) => {

                    const player =
                        players.find(
                            (p) =>
                                p.id ===
                                savedPlayer.id
                        );


                    if (player) {

                        player.score =
                            Number(
                                savedPlayer.score
                            ) || 0;

                    }

                }
            );

        }


        // ========================================
        // 古いデータとの互換性
        // ========================================

        participants.forEach(
            (participant) => {

                if (
                    !Array.isArray(
                        participant.players
                    )
                ) {

                    participant.players = [];

                }


                if (
                    typeof participant.name !==
                    "string"
                ) {

                    participant.name =
                        "参加者";

                }


                if (
                    typeof participant.confirmed !==
                    "boolean"
                ) {

                    participant.confirmed =
                        false;

                }


                if (
                    typeof participant.totalScore !==
                    "number"
                ) {

                    participant.totalScore =
                        0;

                }

            }
        );


    } catch (error) {

        console.error(
            "保存データの読み込みに失敗しました",
            error
        );

        alert(
            "保存されていたゲームデータの読み込みに失敗しました。"
        );

    }

}


// ========================================
// ゲーム名表示更新
// ========================================

function updateGameNameDisplay() {

    gameNameDisplay.textContent =
        gameName;

    gameNameInput.value =
        gameName;

    document.title =
        gameName;

}


// ========================================
// ゲーム名保存
// ========================================

async function saveGameName() {

    const newGameName =
        gameNameInput.value.trim();


    if (
        newGameName === ""
    ) {

        alert(
            "ゲーム名・大会名を入力してください。"
        );

        return;

    }


    // 現在はテスト用ゲームIDを使用
    const gameId =
        "3937728e-32cb-4805-9e8f-88e0edc3cda6";


    const { error } =
        await supabase
            .from("games")
            .update({
                name: newGameName
            })
            .eq("id", gameId);


    if (error) {

        console.error(
            "Game name update error:",
            error
        );

        alert(
            `ゲーム名の保存に失敗しました。\n${error.message}`
        );

        return;

    }


    gameName =
        newGameName;


    updateGameNameDisplay();


    alert(
        "ゲーム名を保存しました！"
    );

}


// ========================================
// 参加者を追加
// ========================================

async function addParticipant() {

    const name =
        nameInput.value.trim();

    if (name === "") {

        alert(
            "参加者名を入力してください"
        );

        return;

    }

    // 現在はテスト用ゲームIDを使用
    const gameId =
        "3937728e-32cb-4805-9e8f-88e0edc3cda6";

    const { data, error } =
        await supabase
            .from("participants")
            .insert({
                game_id: gameId,
                name: name
            })
            .select()
            .single();

    if (error) {

        console.error(
            "Participant insert error:",
            error
        );

        alert(
            `参加者の追加に失敗しました。\n${error.message}`
        );

        return;

    }

    console.log(
        "Participant added:",
        data
    );

    participants.push({

        id: data.id,

        gameId: data.game_id,

        name: data.name,

        players: [],

        totalScore: 0,

        confirmed: false

    });

    nameInput.value = "";

    displayParticipants();

}


// ========================================
// 参加者を削除
// ========================================

async function deleteParticipant(
    participant
) {

    const result =
        confirm(

            `${participant.name}さんを削除しますか？\n\n` +

            "この参加者のドラフト内容もすべて削除されます。"

        );


    if (!result) {

        return;

    }


    const { error } =
        await supabase
            .from("participants")
            .delete()
            .eq("id", participant.id);


    if (error) {

        console.error(
            "Participant delete error:",
            error
        );

        alert(
            `参加者の削除に失敗しました。\n${error.message}`
        );

        return;

    }


    console.log(
        "Participant deleted:",
        participant
    );


    const index =
        participants.indexOf(
            participant
        );


    if (
        index !== -1
    ) {

        participants.splice(
            index,
            1
        );

    }


    displayParticipants();

}


// ========================================
// 参加者名を変更
// ========================================

async function renameParticipant(
    participant
) {

    const newName =
        prompt(
            "新しい参加者名を入力してください",
            participant.name
        );


    if (
        newName === null
    ) {

        return;

    }


    const trimmedName =
        newName.trim();


    if (
        trimmedName === ""
    ) {

        alert(
            "参加者名を入力してください"
        );

        return;

    }


    const { error } =
        await supabase
            .from("participants")
            .update({
                name: trimmedName
            })
            .eq("id", participant.id);


    if (error) {

        console.error(
            "Participant update error:",
            error
        );

        alert(
            `参加者名の変更に失敗しました。\n${error.message}`
        );

        return;

    }


    participant.name =
        trimmedName;


    displayParticipants();

}


// ========================================
// ドラフト編集開始
// ========================================

function editDraft(
    participant
) {

    const result =
        confirm(

            `${participant.name}さんのドラフトを編集しますか？\n\n` +

            "現在の選手選択を変更できるようになります。\n" +

            "編集後はもう一度「ドラフトを確定」してください。"

        );


    if (!result) {

        return;

    }


    participant.confirmed =
        false;


    saveData();

    displayParticipants();

}


// ========================================
// ポイントだけリセット
// ========================================

function resetScoresOnly() {

    const result =
        confirm(

            "選手ポイントだけを0に戻しますか？\n\n" +

            "ドラフト結果と参加者はそのまま残ります。"

        );


    if (!result) {

        return;

    }


    players.forEach(
        (player) => {

            player.score =
                0;

        }
    );


    calculateAllTotalScores();

    saveData();

    displayParticipants();


    alert(
        "ポイントをリセットしました。"
    );

}


// ========================================
// ゲームを最初からやり直す
// ========================================

function resetGameCompletely() {

    const result =
        confirm(

            "ゲームを最初からやり直しますか？\n\n" +

            "以下のデータがすべて削除されます。\n\n" +

            "・ゲーム名\n" +
            "・参加者\n" +
            "・ドラフト結果\n" +
            "・選手ポイント\n\n" +

            "この操作は元に戻せません。"

        );


    if (!result) {

        return;

    }


    const secondConfirm =
        confirm(

            "本当に最初からやり直しますか？\n\n" +

            "必要であれば、先に「ゲームデータをバックアップ」してください。"

        );


    if (!secondConfirm) {

        return;

    }


    participants =
        [];


    gameName =
        DEFAULT_GAME_NAME;


    players.forEach(
        (player) => {

            player.score =
                0;

        }
    );


    saveData();

    updateGameNameDisplay();

    displayParticipants();


    alert(
        "ゲームを最初からやり直しました。"
    );

}


// ========================================
// 他の参加者が選んでいる選手を取得
// ========================================

function getSelectedPlayerIds(
    currentParticipant
) {

    const selectedPlayerIds =
        [];


    participants.forEach(
        (participant) => {

            // 自分自身は除外
            if (
                participant ===
                currentParticipant
            ) {

                return;

            }


            participant.players.forEach(
                (playerId) => {

                    if (
                        playerId !== ""
                    ) {

                        selectedPlayerIds.push(
                            playerId
                        );

                    }

                }
            );

        }
    );


    return selectedPlayerIds;

}


// ========================================
// 女性選手の人数
// ========================================

function getFemaleCount(
    participant
) {

    return participant.players.filter(
        (playerId) => {

            const player =
                players.find(
                    (p) =>
                        p.id ===
                        playerId
                );


            return (
                player &&
                player.gender ===
                    "女性"
            );

        }
    ).length;

}


// ========================================
// 選択人数
// ========================================

function getSelectedCount(
    participant
) {

    return participant.players.filter(
        (playerId) =>
            playerId !== ""
    ).length;

}


// ========================================
// 確定できるか
// ========================================

function canConfirm(
    participant
) {

    const selectedCount =
        getSelectedCount(
            participant
        );


    const femaleCount =
        getFemaleCount(
            participant
        );


    return (
        selectedCount === 4 &&
        femaleCount >= 1
    );

}


// ========================================
// ドラフト確定
// ========================================

async function confirmDraft(
    participant
) {

    if (
        !canConfirm(
            participant
        )
    ) {

        alert(

            "ドラフトを確定できません。\n\n" +

            "・選手を4人選択してください\n" +
            "・女性選手を1人以上選択してください"

        );

        return;

    }


    const result =
        confirm(

            `${participant.name}さんのドラフトを確定しますか？\n\n` +

            "確定後も「ドラフトを編集」から変更できます。"

        );


    if (!result) {

        return;

    }


    participant.confirmed = true;

    const { error } = await supabase
        .from("draft_picks")
        .update({
            confirmed: true
        })
        .eq(
            "game_id",
            "3937728e-32cb-4805-9e8f-88e0edc3cda6"
        )
        .eq(
            "participant_id",
            participant.id
        );

    if (error) {
        console.error(
            "Draft confirmation save error:",
            error
        );

        alert(
            `ドラフト確定状態の保存に失敗しました。\n${error.message}`
        );

        return;
    }

    saveData();

    displayParticipants();

}


// ========================================
// 全員の合計ポイントを計算
// ========================================

function calculateAllTotalScores() {

    participants.forEach(
        (participant) => {

            let total =
                0;


            participant.players.forEach(
                (playerId) => {

                    const player =
                        players.find(
                            (p) =>
                                p.id ===
                                playerId
                        );


                    if (player) {

                        total +=
                            Number(
                                player.score
                            ) || 0;

                    }

                }
            );


            participant.totalScore =
                total;

        }
    );

}


// ========================================
// 4選手のポイントを高い順に取得
// ========================================

function getSortedPlayerScores(
    participant
) {

    return participant.players
        .map(
            (playerId) => {

                const player =
                    players.find(
                        (p) =>
                            p.id ===
                            playerId
                    );


                return player
                    ? Number(
                        player.score
                    ) || 0
                    : 0;

            }
        )
        .sort(
            (a, b) =>
                b - a
        );

}


// ========================================
// 同点時の比較
//
// ① 合計ポイント
// ② 最高ポイントの選手
// ③ 2番目に高い選手
// ④ 3番目
// ⑤ 4番目
// ========================================

function compareParticipants(
    a,
    b
) {

    // 合計ポイント
    if (
        b.totalScore !==
        a.totalScore
    ) {

        return (
            b.totalScore -
            a.totalScore
        );

    }


    const aScores =
        getSortedPlayerScores(
            a
        );

    const bScores =
        getSortedPlayerScores(
            b
        );


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const aScore =
            aScores[i] || 0;

        const bScore =
            bScores[i] || 0;


        if (
            aScore !==
            bScore
        ) {

            return (
                bScore -
                aScore
            );

        }

    }


    // すべて同じ場合
    return 0;

}


// ========================================
// ランキング取得
// ========================================

function getRanking() {

    calculateAllTotalScores();


    return [...participants].sort(
        compareParticipants
    );

}


// ========================================
// 現在の順位
// ========================================

function getCurrentRank(
    participant
) {

    const ranking =
        getRanking();


    const index =
        ranking.indexOf(
            participant
        );


    if (
        index === -1
    ) {

        return "-";

    }


    let rank =
        1;


    for (
        let i = 1;
        i <= index;
        i++
    ) {

        const previous =
            ranking[i - 1];

        const current =
            ranking[i];


        if (
            compareParticipants(
                previous,
                current
            ) !== 0
        ) {

            rank =
                i + 1;

        }

    }


    return rank;

}


// ========================================
// 順位表示
// ========================================

function getRankText(
    rank
) {

    if (
        rank === 1
    ) {

        return "🥇 暫定1位";

    }


    if (
        rank === 2
    ) {

        return "🥈 暫定2位";

    }


    if (
        rank === 3
    ) {

        return "🥉 暫定3位";

    }


    return `暫定${rank}位`;

}


// ========================================
// ポイント入力欄
// ========================================

function createScoreInputs(
    participant,
    container
) {

    container.className =
        "score-container";


    const scoreTitle =
        document.createElement(
            "h4"
        );

    scoreTitle.textContent =
        "選手ポイント";

    scoreTitle.className =
        "score-title";


    container.appendChild(
        scoreTitle
    );


    participant.players.forEach(
        (playerId, index) => {

            const player =
                players.find(
                    (p) =>
                        p.id ===
                        playerId
                );


            if (!player) {

                return;

            }


            const scoreRow =
                document.createElement(
                    "div"
                );

            scoreRow.className =
                "score-row";


            const playerName =
                document.createElement(
                    "span"
                );

            playerName.className =
                "score-player-name";

            playerName.textContent =
                `${index + 1}. ${player.name}（${player.team}）`;


           // ========================================
    // ポイント表示
    // ========================================

    const scoreDisplay =
        document.createElement(
            "span"
        );

    scoreDisplay.className =
        "score-display";

    scoreDisplay.textContent =
        `${Number(player.score) || 0} pt`;


    scoreRow.appendChild(
        playerName
    );

    scoreRow.appendChild(
        scoreDisplay
    );


    container.appendChild(
        scoreRow
    );

        }
    );

    // ========================================
    // 合計
    // ========================================

    const totalScoreElement =
        document.createElement(
            "p"
        );

    totalScoreElement.className =
        "total-score-detail";


    totalScoreElement.textContent =
        `合計ポイント：${participant.totalScore.toFixed(1)} pt`;


    container.appendChild(
        totalScoreElement
    );

}

// ========================================
// ポイント変更時の表示更新
// ========================================

function updateScoreDisplays() {

    calculateAllTotalScores();


    participants.forEach(
        (participant, index) => {

            const card =
                document.querySelector(
                    `[data-participant-index="${index}"]`
                );


            if (!card) {

                return;

            }


            // 順位
            const rankBadge =
                card.querySelector(
                    ".rank-badge"
                );


            if (rankBadge) {

                const rank =
                    getCurrentRank(
                        participant
                    );


                rankBadge.textContent =
                    getRankText(
                        rank
                    );

            }


            // ヘッダー合計
            const totalScoreValue =
                card.querySelector(
                    ".total-score-value"
                );


            if (totalScoreValue) {

                totalScoreValue.textContent =
                    `${participant.totalScore.toFixed(1)} pt`;

            }


            // 下部合計
            const totalScoreDetail =
                card.querySelector(
                    ".total-score-detail"
                );


            if (totalScoreDetail) {

                totalScoreDetail.textContent =
                    `合計ポイント：${participant.totalScore.toFixed(1)} pt`;

            }

        }
    );


    if (
        areAllParticipantsConfirmed()
    ) {

        updateRankingDisplay();

    }

}


// ========================================
// 全員確定済みか
// ========================================

function areAllParticipantsConfirmed() {

    if (
        participants.length === 0
    ) {

        return false;

    }


    return participants.every(
        (participant) =>
            participant.confirmed
    );

}


// ========================================
// ゲームデータをバックアップ
// ========================================

function backupGameData() {

    calculateAllTotalScores();


    const backupData = {

        backupVersion:
            2,

        backupType:
            "m-league-draft-game-data",

        gameName:
            gameName,

        savedAt:
            new Date().toISOString(),

        participants:
            participants,

        players:
            players

    };


    const json =
        JSON.stringify(
            backupData,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    const date =
        new Date();


    const dateString =
        date
            .toISOString()
            .slice(
                0,
                10
            );


    link.download =
        `m-league-game-backup-${dateString}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    alert(
        "ゲームデータをバックアップしました！"
    );

}


// ========================================
// ゲームデータを復元
// ========================================

function restoreGameData(
    file
) {

    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );


                // ========================================
                // データ形式チェック
                // ========================================

                if (
                    !data ||
                    data.backupType !==
                        "m-league-draft-game-data"
                ) {

                    alert(
                        "このファイルはMリーグドラフトのゲームデータではありません。"
                    );

                    return;

                }


                if (
                    !Array.isArray(
                        data.participants
                    )
                ) {

                    alert(
                        "参加者データが正しくありません。"
                    );

                    return;

                }


                if (
                    !Array.isArray(
                        data.players
                    )
                ) {

                    alert(
                        "選手データが正しくありません。"
                    );

                    return;

                }


                // ========================================
                // 最終確認
                // ========================================

                const result =
                    confirm(

                        "このゲームデータを復元しますか？\n\n" +

                        `ゲーム名：${data.gameName || DEFAULT_GAME_NAME}\n` +

                        `参加者：${data.participants.length}人\n\n` +

                        "現在のゲームデータは上書きされます。"

                    );


                if (!result) {

                    return;

                }


                // ========================================
                // ゲーム名
                // ========================================

                if (
                    typeof data.gameName ===
                    "string" &&
                    data.gameName.trim() !== ""
                ) {

                    gameName =
                        data.gameName.trim();

                } else {

                    gameName =
                        DEFAULT_GAME_NAME;

                }


                // ========================================
                // 参加者
                // ========================================

                participants =
                    data.participants.map(
                        (participant) => ({

                            name:
                                typeof participant.name ===
                                    "string"
                                    ? participant.name
                                    : "参加者",

                            players:
                                Array.isArray(
                                    participant.players
                                )
                                    ? participant.players
                                    : [],

                            totalScore:
                                Number(
                                    participant.totalScore
                                ) || 0,

                            confirmed:
                                participant.confirmed ===
                                true

                        })
                    );


                // ========================================
                // ポイント
                // ========================================

                // まず全員0
                players.forEach(
                    (player) => {

                        player.score =
                            0;

                    }
                );


                // バックアップのポイントを反映
                data.players.forEach(
                    (savedPlayer) => {

                        const player =
                            players.find(
                                (p) =>
                                    p.id ===
                                    savedPlayer.id
                            );


                        if (
                            player
                        ) {

                            player.score =
                                Number(
                                    savedPlayer.score
                                ) || 0;

                        }

                    }
                );


                calculateAllTotalScores();

                saveData();

                updateGameNameDisplay();

                displayParticipants();


                alert(
                    "ゲームデータを復元しました！"
                );


            } catch (error) {

                console.error(
                    "ゲームデータの復元に失敗しました",
                    error
                );


                alert(
                    "ゲームデータの復元に失敗しました。\n\nJSONファイルが壊れている可能性があります。"
                );

            } finally {

                // 同じファイルをもう一度選択できるようにする
                restoreFileInput.value =
                    "";

            }

        };


    reader.onerror =
        function () {

            alert(
                "ファイルの読み込みに失敗しました。"
            );

            restoreFileInput.value =
                "";

        };


    reader.readAsText(
        file,
        "UTF-8"
    );

}


// ========================================
// 結果を保存
// ========================================

function saveResultFile() {

    calculateAllTotalScores();


    const ranking =
        getRanking();


    const resultData = {

        gameName:
            gameName,

        savedAt:
            new Date().toISOString(),

        ranking:
            ranking.map(
                (participant) => ({

                    rank:
                        getCurrentRank(
                            participant
                        ),

                    name:
                        participant.name,

                    players:
                        participant.players.map(
                            (playerId) => {

                                const player =
                                    players.find(
                                        (p) =>
                                            p.id ===
                                            playerId
                                    );


                                return {

                                    name:
                                        player
                                            ? player.name
                                            : "",

                                    team:
                                        player
                                            ? player.team
                                            : "",

                                    score:
                                        player
                                            ? player.score
                                            : 0

                                };

                            }
                        ),

                    totalScore:
                        participant.totalScore

                })
            )

    };


    const json =
        JSON.stringify(
            resultData,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    const date =
        new Date();


    const dateString =
        date
            .toISOString()
            .slice(
                0,
                10
            );


    link.download =
        `m-league-result-${dateString}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    alert(
        "結果を保存しました！"
    );

}


// ========================================
// ランキング表示
// ========================================

function displayRanking() {

    const oldRanking =
        document.getElementById(
            "rankingContainer"
        );


    if (oldRanking) {

        oldRanking.remove();

    }


    const ranking =
        getRanking();


    const rankingContainer =
        document.createElement(
            "div"
        );


    rankingContainer.id =
        "rankingContainer";


    const rankingTitle =
        document.createElement(
            "h2"
        );


    rankingTitle.textContent =
        `🏆 ${gameName} ランキング`;


    rankingTitle.className =
        "ranking-title";


    rankingContainer.appendChild(
        rankingTitle
    );


    // ========================================
    // バックアップ・復元
    // ========================================

    const gameDataArea =
        document.createElement(
            "div"
        );


    gameDataArea.className =
        "game-data-area";


    const backupButton =
        document.createElement(
            "button"
        );


    backupButton.textContent =
        "💾 ゲームデータをバックアップ";


    backupButton.className =
        "backup-button";


    backupButton.addEventListener(
        "click",
        backupGameData
    );


    const restoreButton =
        document.createElement(
            "button"
        );


    restoreButton.textContent =
        "📂 ゲームデータを復元";


    restoreButton.className =
        "restore-button";


    restoreButton.addEventListener(
        "click",
        function () {

            restoreFileInput.click();

        }
    );


    gameDataArea.appendChild(
        backupButton
    );

    gameDataArea.appendChild(
        restoreButton
    );


    rankingContainer.appendChild(
        gameDataArea
    );


    // ========================================
    // 結果保存
    // ========================================

    const saveButton =
        document.createElement(
            "button"
        );


    saveButton.textContent =
        "📄 結果を保存";


    saveButton.className =
        "result-save-button";


    saveButton.addEventListener(
        "click",
        saveResultFile
    );


    rankingContainer.appendChild(
        saveButton
    );


    // ========================================
    // ランキング
    // ========================================

    ranking.forEach(
        (participant) => {

            const rankingRow =
                document.createElement(
                    "div"
                );


            rankingRow.className =
                "ranking-row";


            const rankText =
                document.createElement(
                    "span"
                );


            rankText.className =
                "ranking-rank";


            rankText.textContent =
                getRankText(
                    getCurrentRank(
                        participant
                    )
                );


            const nameText =
                document.createElement(
                    "span"
                );


            nameText.className =
                "ranking-name";


            nameText.textContent =
                participant.name;


            const scoreText =
                document.createElement(
                    "span"
                );


            scoreText.className =
                "ranking-score";


            scoreText.textContent =
                `${participant.totalScore.toFixed(1)} pt`;


            rankingRow.appendChild(
                rankText
            );

            rankingRow.appendChild(
                nameText
            );

            rankingRow.appendChild(
                scoreText
            );


            rankingContainer.appendChild(
                rankingRow
            );

        }
    );


    participantList.appendChild(
        rankingContainer
    );

}


// ========================================
// ランキング更新
// ========================================

function updateRankingDisplay() {

    const rankingContainer =
        document.getElementById(
            "rankingContainer"
        );


    if (!rankingContainer) {

        displayRanking();

        return;

    }


    const ranking =
        getRanking();


    const rows =
        rankingContainer.querySelectorAll(
            ".ranking-row"
        );


    ranking.forEach(
        (participant, index) => {

            const row =
                rows[index];


            if (!row) {

                return;

            }


            const rankText =
                row.querySelector(
                    ".ranking-rank"
                );


            const nameText =
                row.querySelector(
                    ".ranking-name"
                );


            const scoreText =
                row.querySelector(
                    ".ranking-score"
                );


            if (rankText) {

                rankText.textContent =
                    getRankText(
                        getCurrentRank(
                            participant
                        )
                    );

            }


            if (nameText) {

                nameText.textContent =
                    participant.name;

            }


            if (scoreText) {

                scoreText.textContent =
                    `${participant.totalScore.toFixed(1)} pt`;

            }

        }
    );

}


// ========================================
// 参加者一覧表示
// ========================================

function displayParticipants() {

    calculateAllTotalScores();


    participantList.innerHTML =
        "";


    // ========================================
    // 参加者カード
    // ========================================

    participants.forEach(
        (
            participant,
            participantIndex
        ) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "participant-card";


            div.dataset.participantIndex =
                participantIndex;


            if (
                participant.confirmed
            ) {

                div.classList.add(
                    "confirmed-card"
                );

            }


            // ========================================
            // ヘッダー
            // ========================================

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "participant-header";


            // ========================================
            // 名前
            // ========================================

            const title =
                document.createElement(
                    "h3"
                );


            title.className =
                "participant-name";


            title.textContent =
                `${participantIndex + 1}. ${participant.name}`;


            // ========================================
            // 名前変更
            // ========================================

            const renameButton =
                document.createElement(
                    "button"
                );


            renameButton.textContent =
                "✏️";


            renameButton.title =
                "参加者名を変更";


            renameButton.className =
                "small-action-button";


            renameButton.addEventListener(
                "click",
                function () {

                    renameParticipant(
                        participant
                    );

                }
            );


            // ========================================
            // 順位エリア
            // ========================================

            const rankingArea =
                document.createElement(
                    "div"
                );


            rankingArea.className =
                "participant-ranking";


            const rank =
                getCurrentRank(
                    participant
                );


            const rankBadge =
                document.createElement(
                    "span"
                );


            rankBadge.className =
                "rank-badge";


            if (
                rank <= 3
            ) {

                rankBadge.classList.add(
                    "top-rank"
                );

            }


            rankBadge.textContent =
                getRankText(
                    rank
                );


            // ========================================
            // 合計ポイント
            // ========================================

            const totalScore =
                document.createElement(
                    "div"
                );


            totalScore.className =
                "total-score";


            const totalScoreLabel =
                document.createElement(
                    "span"
                );


            totalScoreLabel.className =
                "total-score-label";


            totalScoreLabel.textContent =
                "合計ポイント";


            const totalScoreValue =
                document.createElement(
                    "span"
                );


            totalScoreValue.className =
                "total-score-value";


            totalScoreValue.textContent =
                `${participant.totalScore.toFixed(1)} pt`;


            totalScore.appendChild(
                totalScoreLabel
            );

            totalScore.appendChild(
                totalScoreValue
            );


            rankingArea.appendChild(
                rankBadge
            );

            rankingArea.appendChild(
                totalScore
            );


            // ========================================
            // 名前エリア
            // ========================================

            const nameArea =
                document.createElement(
                    "div"
                );


            nameArea.className =
                "participant-name-area";


            nameArea.appendChild(
                title
            );

            nameArea.appendChild(
                renameButton
            );


            header.appendChild(
                nameArea
            );

            header.appendChild(
                rankingArea
            );


            div.appendChild(
                header
            );


            // ========================================
            // 削除ボタン
            // ========================================

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.textContent =
                "🗑️ 参加者を削除";


            deleteButton.className =
                "delete-button";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteParticipant(
                        participant
                    );

                }
            );


            div.appendChild(
                deleteButton
            );


            // ========================================
            // 確定済み
            // ========================================

            if (
                participant.confirmed
            ) {

                const confirmedInfo =
                    document.createElement(
                        "div"
                    );


                confirmedInfo.className =
                    "confirmed-badge";


                confirmedInfo.textContent =
                    "🔒 ドラフト確定済み";


                div.appendChild(
                    confirmedInfo
                );


                // ========================================
                // 編集ボタン
                // ========================================

                const editButton =
                    document.createElement(
                        "button"
                    );


                editButton.textContent =
                    "✏️ ドラフトを編集";


                editButton.className =
                    "edit-draft-button";


                editButton.addEventListener(
                    "click",
                    function () {

                        editDraft(
                            participant
                        );

                    }
                );


                div.appendChild(
                    editButton
                );

            }


            // ========================================
            // 選手選択
            // ========================================

            for (
                let i = 0;
                i < 4;
                i++
            ) {

                const selectRow =
                    document.createElement(
                        "div"
                    );


                selectRow.className =
                    "player-select-row";


                const playerNumber =
                    document.createElement(
                        "span"
                    );


                playerNumber.className =
                    "player-number";


                playerNumber.textContent =
                    `選手${i + 1}`;


                const select =
                    document.createElement(
                        "select"
                    );


                select.className =
                    "player-select";


                if (
                    participant.confirmed
                ) {

                    select.disabled =
                        true;

                }


                const defaultOption =
                    document.createElement(
                        "option"
                    );


                defaultOption.value =
                    "";


                defaultOption.textContent =
                    "選手を選択";


                select.appendChild(
                    defaultOption
                );


                const currentPlayerId =
                    participant.players[i];


                const selectedPlayerIds =
                    getSelectedPlayerIds(
                        participant
                    );


                players.forEach(
                    (player) => {

                        const option =
                            document.createElement(
                                "option"
                            );


                        option.value =
                            player.id;


                        option.textContent =
                             `${player.name}（${player.team}） ${Number(player.score) || 0}pt`;

                        if (
                            selectedPlayerIds.includes(
                                player.id
                            )
                        ) {

                            option.disabled =
                                true;

                        }


                        if (
                            currentPlayerId ===
                            player.id
                        ) {

                            option.selected =
                                true;

                        }


                        select.appendChild(
                            option
                        );

                    }
                );


                // ========================================
                // 選手変更
                // ========================================

                select.addEventListener(
                    "change",
                    async function () {

                        if (
                            participant.confirmed
                        ) {

                            return;

                        }


                        const newPlayerId =
                            select.value;

                        console.log(
                            "選択されたplayerId:",
                            newPlayerId
                        );


                        const alreadySelected =
                            participant.players.some(
                                (
                                    playerId,
                                    playerIndex
                                ) =>

                                    playerIndex !== i &&
                                    playerId ===
                                        newPlayerId &&
                                    newPlayerId !== ""

                            );


                        if (
                            alreadySelected
                        ) {

                            alert(
                                "この参加者は、その選手をすでに選択しています。"
                            );


                            displayParticipants();

                            return;

                        }


                        const selectedByOther =
                            getSelectedPlayerIds(
                                participant
                            ).includes(
                                newPlayerId
                            );


                        if (
                            selectedByOther
                        ) {

                            alert(
                                "その選手は他の参加者が選択しています。"
                            );


                            displayParticipants();

                            return;

                        }


                        const gameId =
                            "3937728e-32cb-4805-9e8f-88e0edc3cda6";

                        const slot =
                            i + 1;

                        const { data, error } =
                            await supabase
                                .from("draft_picks")
                                .upsert(
                                    {
                                        game_id: gameId,
                                        participant_id: participant.id,
                                        player_id: newPlayerId,
                                        slot: slot,
                                        confirmed: false
                                    },
                                    {
                                        onConflict:
                                            "game_id,participant_id,slot"
                                    }
                                )
                                .select()
                                .single();

                        if (error) {
                            console.error(
                                "Draft pick save error:",
                                error
                            );

                            alert(
                                `ドラフト選択の保存に失敗しました。\n${error.message}`
                            );

                            displayParticipants();

                            return;
                        }

                        console.log(
                            "Draft pick saved:",
                            data
                        );

                        participant.players[i] =
                            newPlayerId;

                        displayParticipants();

                    }
                );


                selectRow.appendChild(
                    playerNumber
                );

                selectRow.appendChild(
                    select
                );


                div.appendChild(
                    selectRow
                );

            }


            // ========================================
            // 選択状況
            // ========================================

            const selectedCount =
                getSelectedCount(
                    participant
                );


            const femaleCount =
                getFemaleCount(
                    participant
                );


            const statusArea =
                document.createElement(
                    "div"
                );


            statusArea.className =
                "selection-status";


            const selectedInfo =
                document.createElement(
                    "span"
                );


            selectedInfo.className =
                "status-badge";


            if (
                selectedCount === 4
            ) {

                selectedInfo.classList.add(
                    "ok"
                );

            }


            selectedInfo.textContent =
                `選択人数：${selectedCount} / 4人`;


            const femaleInfo =
                document.createElement(
                    "span"
                );


            femaleInfo.className =
                "status-badge";


            if (
                femaleCount >= 1
            ) {

                femaleInfo.classList.add(
                    "ok"
                );


                femaleInfo.textContent =
                    `女性選手：${femaleCount}人 ✅`;

            } else {

                femaleInfo.classList.add(
                    "ng"
                );


                femaleInfo.textContent =
                    `女性選手：${femaleCount}人 ❌`;

            }


            statusArea.appendChild(
                selectedInfo
            );

            statusArea.appendChild(
                femaleInfo
            );


            div.appendChild(
                statusArea
            );


            // ========================================
            // 確定ボタン
            // ========================================

            if (
                !participant.confirmed
            ) {

                const confirmButton =
                    document.createElement(
                        "button"
                    );


                confirmButton.className =
                    "confirm-button";


                confirmButton.textContent =
                    "ドラフトを確定";


                confirmButton.disabled =
                    !canConfirm(
                        participant
                    );


                confirmButton.addEventListener(
                    "click",
                    function () {

                        confirmDraft(
                            participant
                        );

                    }
                );


                div.appendChild(
                    confirmButton
                );

            }


            // ========================================
            // ポイント入力
            // ========================================

            if (
                participant.confirmed
            ) {

                const scoreContainer =
                    document.createElement(
                        "div"
                    );


                createScoreInputs(
                    participant,
                    scoreContainer
                );


                div.appendChild(
                    scoreContainer
                );

            }


            participantList.appendChild(
                div
            );

        }
    );


    // ========================================
    // 画面下部の操作エリア
    // ========================================

    if (
        participants.length > 0
    ) {

        const controlArea =
            document.createElement(
                "div"
            );


        controlArea.className =
            "control-area";


        // ========================================
        // ポイントだけリセット
        // ========================================

        const resetScoresButton =
            document.createElement(
                "button"
            );


        resetScoresButton.textContent =
            "🔢 ポイントだけリセット";


        resetScoresButton.className =
            "reset-scores-button";


        resetScoresButton.addEventListener(
            "click",
            resetScoresOnly
        );


        // ========================================
        // ゲームを最初から
        // ========================================

        const resetGameButton =
            document.createElement(
                "button"
            );


        resetGameButton.textContent =
            "⚠️ ゲームを最初からやり直す";


        resetGameButton.className =
            "reset-game-button";


        resetGameButton.addEventListener(
            "click",
            resetGameCompletely
        );


        // ========================================
        // バックアップ
        // ========================================

        const backupButton =
            document.createElement(
                "button"
            );


        backupButton.textContent =
            "💾 ゲームデータをバックアップ";


        backupButton.className =
            "backup-button";


        backupButton.addEventListener(
            "click",
            backupGameData
        );


        // ========================================
        // 復元
        // ========================================

        const restoreButton =
            document.createElement(
                "button"
            );


        restoreButton.textContent =
            "📂 ゲームデータを復元";


        restoreButton.className =
            "restore-button";


        restoreButton.addEventListener(
            "click",
            function () {

                restoreFileInput.click();

            }
        );


        controlArea.appendChild(
            resetScoresButton
        );

        controlArea.appendChild(
            backupButton
        );

        controlArea.appendChild(
            restoreButton
        );

        controlArea.appendChild(
            resetGameButton
        );


        participantList.appendChild(
            controlArea
        );

    }


    // ========================================
    // 全員確定後
    // ========================================

    if (
        areAllParticipantsConfirmed()
    ) {

        displayRanking();

    }

}

async function testSupabaseConnection() {
    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    console.log(
        "Supabase session:",
        sessionData.session
    );

    console.log(
        "Session error:",
        sessionError
    );

    const { data: supabasePlayers, error: playersError } =
        await supabase
            .from("players")
            .select("id, name, team, gender")
            .order("id");

console.log(
    "Supabase players:",
    supabasePlayers
);

if (playersError) {
    console.error(
        "Players error:",
        playersError
    );

    return;
}

const { data: playerScores, error: playerScoresError } =
    await supabase
        .from("player_scores")
        .select("player_id, score")
        .eq("season_id", "season_001");

if (playerScoresError) {
    console.error(
        "Player scores error:",
        playerScoresError
    );

    return;
}

console.log(
    "Supabase player scores:",
    playerScores
);

players = supabasePlayers.map((player) => {
    const scoreData =
        playerScores.find(
            (score) =>
                score.player_id === player.id
        );

    return {
        ...player,
        score: scoreData
            ? Number(scoreData.score)
            : 0
    };
});

console.log(
    "ポイント反映後のplayers:",
    players
);

    // Supabaseから保存済みのドラフト指名を取得
    const { data: draftPicks, error: draftPicksError } =
        await supabase
            .from("draft_picks")
            .select(
                "participant_id, player_id, slot, confirmed"
            )
            .eq(
                "game_id",
                "3937728e-32cb-4805-9e8f-88e0edc3cda6"
            )
            .order("slot");

    if (draftPicksError) {
        console.error(
            "Draft picks load error:",
            draftPicksError
        );

        return;
    }

    console.log(
        "Supabase draft picks:",
        draftPicks
    );

    // 取得したドラフト内容を参加者データに反映
    draftPicks.forEach((pick) => {
        const participant = participants.find(
            (participant) =>
                participant.id === pick.participant_id
        );

        if (!participant) {
            return;
        }

        if (!participant.players) {
            participant.players = [];
        }

        participant.players[pick.slot - 1] =
            pick.player_id;

        if (pick.confirmed) {
            participant.confirmed = true;
        }
    });

    console.log(
        "ドラフト反映後のparticipants:",
        participants
    );

    displayParticipants();
}
testSupabaseConnection()

const loginButton = document.getElementById('loginButton')

loginButton.addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    const loginMessage = document.getElementById('loginMessage')

    loginMessage.textContent = 'ログイン中...'

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error('Login error:', error)
        loginMessage.textContent = `ログインに失敗しました：${error.message}`
        return
    }

    console.log('Login success:', data)
    loginMessage.textContent = 'ログインしました！'
})

async function loadParticipantsFromSupabase() {

    const { data, error } =
        await supabase
            .from('participants')
            .select(
                'id, game_id, name, created_at, updated_at'
            )
            .order(
                'created_at',
                { ascending: true }
            )


    if (error) {

        console.error(
            'Participants error:',
            error
        )

        return

    }


    participants =
        data.map((participant) => ({

            id:
                participant.id,

            gameId:
                participant.game_id,

            name:
                participant.name,

            players: [],

            totalScore: 0,

            confirmed: false

        }))


    console.log(
        'Participants loaded:',
        participants
    )


    displayParticipants()

}

loadParticipantsFromSupabase()

async function loadGameFromSupabase() {

    const gameId =
        "3937728e-32cb-4805-9e8f-88e0edc3cda6";


    const { data, error } =
        await supabase
            .from("games")
            .select("id, name, status")
            .eq("id", gameId)
            .single();


    if (error) {

        console.error(
            "Game error:",
            error
        );

        return;

    }


    gameName =
        data.name;


    updateGameNameDisplay();


    console.log(
        "Game loaded:",
        data
    );

}

loadGameFromSupabase();