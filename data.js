// Resource Definitions (ID -> Display Name)
const RESOURCE_NAMES = {
    ruby: "루비",
    ap: "어빌리티 포인트",
    magic: "마법",
    dimension_key: "차원의 열쇠",
    dungeon_key: "던전 열쇠",
    exploration_key: "탐험 열쇠",
    golden_key: "황금 열쇠",
    silver_key: "은 열쇠",
    faded_medal: "빛바랜 명예 훈장",
    hunter_medal: "사냥꾼의 훈장",
    honor_medal: "명예 훈장",
    chaos_medal: "혼돈 훈장",
    dimension_fragment: "차원의 조각",
    time_scroll: "시간 스크롤",
    abyss_scroll: "심층 스크롤",
    magic_stone: "마정석",
    transcendence_stone: "초월석",
    magic_draw: "마뽑",
    mystery_crystal: "신비한 차원의 결정",
    top_amulet: "최상급 아뮬렛",
    random_box: "정령의 성장 상자",
    monthly_random_box: "월간 랜덤 상자",
    season_random_box: "시즌 랜덤 상자",
    event_time: "이벤트 던전 시간(분)",
    spirit_stone_buff: "정령석 획득량(배치)",
    spirit_trait_point: "정령 특성 포인트",
    magic_core_level: "마법 코어 최대 레벨",
    unstable_eternal_crystal: "불안정한 영원 결정",
    endless_eternal_crystal: "끝없는 영원 결정"
};

// Main Data
const packages = [
    {
        id: "burning_boost",
        name: "버닝 부스트 패키지",
        price: 1500,
        count: 1,
        tier: "SSS",
        description: "초보자면 말할 필요도 없고, 그게 아니라도 가성비 최고로 재화를 얻을 수 있는 패키지",
        contents: {
            magic_stone: 130000000,
            ruby: 5500000,
            ap: 2250000,
            dimension_key: 4500,
            magic: 15000,
            faded_medal: 1500000,
            hunter_medal: 400000,
            transcendence_stone: 1300
        }
        // valueScore calculated dynamically later based on Ruby efficiency? 
        // For now, let's inject manual score or calculate in main.js
    },
    {
        id: "memorial_costume",
        name: "메모리얼 코스튬",
        price: 29700,
        count: 2,
        tier: "S",
        tierTooltip: "초월석이 급격히 필요한 '각성을 거의 하지 않은 뉴비'에게는 SSS급입니다.",
        description: "코스튬을 빼더라도 효율 1-2티어 급인 패키지입니다. 30만 루비는 실 구매에 쓰이므로 차감",
        contents: {
            ruby: -300000, // Negative ruby based on user input? Keeping as is.
            ap: 10000000,
            dungeon_key: 2025,
            dimension_fragment: 2200,
            exploration_key: 150,
            abyss_scroll: 1725,
            golden_key: 2,
            magic_draw: 100000,
            mystery_crystal: 180,
            time_scroll: 75,
            transcendence_stone: 300000
        }
    },
    {
        id: "ad_removal",
        name: "광고 제거",
        price: 12000,
        count: 1,
        tier: "SSS",
        description: "재화는 그닥이지만 광고 제거의 편의성 하나만 보고 살 만한 패키지입니다.",
        contents: {
            ruby: 120000,
            dungeon_key: 160,
            dimension_fragment: 240,
            golden_key: 1
        }
    },
    {
        id: "dimension_pile",
        name: "차원의 조각 무더기",
        price: 16000,
        count: 3,
        tier: "S",
        description: "차원의 조각만 봤을 때는 최고로 효율적인 패키지. 단 다른 재화도 보자면 핫딜 먼저 사는 걸 추천합니다.",
        contents: {
            dimension_fragment: 2500,
            time_scroll: 50,
            silver_key: 1
        }
    },
    {
        id: "ruby_bomb",
        name: "루비 폭탄 상자",
        price: 16000,
        count: 3,
        tier: "B",
        description: "루비와 어빌리티 포인트를 많이 주긴 하는데, 딱 거기까지 입니다. 어빌포가 부족하다면 A까지 줄 수는 있겠지만, 코스튬 투자가 거의 안 된 게 아니고서야 이거까지 지를 일은 거의 없을 겁니다.",
        contents: {
            ruby: 5000000,
            ap: 5000000,
            time_scroll: 15,
            silver_key: 1
        }
    },
    {
        id: "wizard_full",
        name: "마법사 패키지 (전체 구매)",
        type: "stepup",
        tier: "SSS",
        tierTooltip: "초보 마법사 패키지 단독 구매 시 SSS급이며, 전체 구매 합산 시에는 B급 효율로 낮아집니다.",
        description: "초보~마스터 마법사 패키지 합계. 각종 확률 버프 포함.",
        subPackages: [
            { id: "wizard_novice", name: "초보 마법사", price: 11000, count: 1, tier: "SSS", description: "버프 무한 적용, 매일 던전 열쇠 10개 지급.", contents: { ruby: 110000, dungeon_key: 130, magic: 10000, golden_key: 1 } },
            { id: "wizard_inter", name: "중급 마법사", price: 33000, count: 1, tier: "B", description: "공격력/체력 2배, 장신구 추가 획득 확률 15%.", contents: { ruby: 330000, dungeon_key: 440, dimension_fragment: 700, magic: 30000, golden_key: 2 } },
            { id: "wizard_adv", name: "상급 마법사", price: 55000, count: 1, tier: "B", description: "아이템 획득 확률 15%.", contents: { ruby: 550000, dungeon_key: 700, dimension_fragment: 1100, magic: 60000, golden_key: 3 } },
            { id: "wizard_master", name: "마스터 마법사", price: 110000, count: 1, tier: "B", description: "특수 아이템 획득 확률 10%, 초월석 추가 획득 확률 10%.", contents: { ruby: 1100000, dungeon_key: 1650, dimension_fragment: 2500, magic: 150000, golden_key: 5 } }
        ]
    },
    {
        id: "costume_pkg",
        name: "코스튬 패키지 (10회)",
        price: 55000,
        count: 10,
        tier: "B",
        description: "정령의 성장 상자 50개 포함. 아이템 획득 확률 3%, 특수 아이템 획득 확률 1%가 있습니다. 좋은 효율은 아니지만, 드랍률을 신경쓴다면 사서 나쁠 건 없습니다.",
        contents: {
            ruby: 550000,
            ap: 15000000,
            golden_key: 3,
            dungeon_key: 750,      // 15 * 50
            dimension_key: 500,    // 10 * 50
            abyss_scroll: 750,     // 15 * 50
            time_scroll: 500       // 250 + (5 * 50)
        }
    },
    {
        id: "chloe_full",
        name: "클로에 스텝업 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "클로에 1차~4차 및 보너스까지 모두 획득 시 총합.",
        // Parent contents/price will be calculated automatically in main.js
        subPackages: [
            {
                id: "chloe_1",
                name: "클로에 1차",
                price: 3300,
                count: 2, // Must buy 2 times
                tier: "B",
                contents: {
                    ruby: 33000,
                    dungeon_key: 50,
                    dimension_key: 2500,
                    magic: 10000,
                    time_scroll: 15,
                    silver_key: 1
                }
            },
            {
                id: "chloe_2",
                name: "클로에 2차",
                price: 5500,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 55000,
                    dungeon_key: 70,
                    dimension_key: 5000,
                    ap: 5000000,
                    time_scroll: 25,
                    silver_key: 2
                }
            },
            {
                id: "chloe_3",
                name: "클로에 3차",
                price: 11000,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 110000,
                    dungeon_key: 130,
                    exploration_key: 130,
                    dimension_fragment: 220,
                    time_scroll: 50,
                    silver_key: 3
                }
            },
            {
                id: "chloe_4",
                name: "클로에 4차",
                price: 22000,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 220000,
                    dungeon_key: 280,
                    exploration_key: 280,
                    dimension_fragment: 450,
                    time_scroll: 100,
                    silver_key: 5
                }
            },
            {
                id: "chloe_bonus",
                name: "클로에 보너스",
                price: 0,
                count: 1, // Bonus is 1 time
                tier: "B",
                contents: {
                    ruby: 549900,
                    top_amulet: 3,
                    dungeon_key: 700,
                    dimension_fragment: 1400,
                    magic: 33000,
                    golden_key: 2
                }
            }
        ]
    },
    {
        id: "anniversary_1",
        name: "4.5주년 감사 패키지 1",
        price: 19000,
        count: 2,
        tier: "S",
        description: "초반이든 후반이든 잘 쓰이는 재화들만 모여 있습니다. 가성비도 좋아 S급을 받기 무리가 없습니다.",
        contents: {
            dungeon_key: 1000,
            dimension_fragment: 1500,
            abyss_scroll: 1200,
            top_amulet: 5,
            magic: 220000,
            golden_key: 3
        }
    },
    {
        id: "anniversary_2",
        name: "4.5주년 감사 패키지 2",
        price: 29000,
        count: 2,
        tier: "S",
        tierTooltip: "각성을 거의 하지 않은 뉴비들은 SSS급으로 볼 수 있습니다. 초월석을 주거든요.",
        description: "열쇠와 신차결, 초월석 위주 구성이지만, 이것도 전반적으로 효율이 매우 좋습니다. 굳이 등급을 매기자면 재화 범용성으로 인해 SS-S 사이?",
        contents: {
            dungeon_key: 1500,
            exploration_key: 1000,
            dimension_fragment: 2250,
            transcendence_stone: 220000,
            mystery_crystal: 220,
            golden_key: 5
        }
    },
    {
        id: "lunar_hotdeal",
        name: "설날 핫딜 패키지",
        price: 9900,
        count: 2,
        tier: "SS",
        description: "가성비가 거의 1등인 패키지입니다. 정기적으로 과금하려는 사람이 이걸 안 사면 안 될 정도입니다.",
        contents: {
            dungeon_key: 600,
            dimension_fragment: 1200,
            ap: 20000000,
            magic: 55000,
            time_scroll: 100,
            golden_key: 1
        }
    },
    {
        id: "lunar_stepup_full",
        name: "설날 한정 스텝업 (전체 구매)",
        type: "stepup",
        tier: "S",
        description: "1~4단계 구매 시 5단계 보너스 획득 가능.",
        subPackages: [
            { id: "lunar_s1", name: "설날 1단계", price: 11000, count: 1, contents: { ruby: 110000, dungeon_key: 130, dimension_fragment: 220, abyss_scroll: 120, magic: 3000, golden_key: 1 } },
            { id: "lunar_s2", name: "설날 2단계", price: 33000, count: 1, contents: { ruby: 330000, dungeon_key: 400, dimension_fragment: 660, abyss_scroll: 360, magic: 10000, golden_key: 1 } },
            { id: "lunar_s3", name: "설날 3단계", price: 55000, count: 1, contents: { ruby: 550000, dungeon_key: 700, dimension_fragment: 1100, abyss_scroll: 600, magic: 20000, golden_key: 2 } },
            { id: "lunar_s4", name: "설날 4단계", price: 110000, count: 1, contents: { ruby: 1100000, dungeon_key: 1500, dimension_fragment: 2200, abyss_scroll: 1200, magic: 50000, golden_key: 3 } },
            { id: "lunar_s5", name: "설날 5단계 (보너스)", price: 0, count: 1, contents: { ruby: 5499900, dungeon_key: 2000, top_amulet: 5, magic: 50000, mystery_crystal: 120, golden_key: 3 } }
        ]
    },
    {
        id: "dungeon_daily",
        name: "던전 데일리 패스",
        price: 11000,
        count: 1,
        tier: "S",
        description: "한 달에 한 번 구매 가능합니다. 던열만 보면 가성비 최고지만, 다른 재화까지 생각하면 다른 더 좋은 것들이 있습니다.",
        contents: {
            ruby: 4000000,
            dungeon_key: 1350,
            abyss_scroll: 600,
            time_scroll: 90,
            silver_key: 5
        }
    },
    {
        id: "dimension_daily",
        name: "차원 데일리 패스",
        price: 22000,
        count: 1,
        tier: "S",
        description: "한 달에 한 번 구매 가능합니다. 차열만 보면 버닝 부스트 빼고 최고지만, 다른 재화까지 보면 던전 데일리와 비슷하게 더 좋은 것들이 있습니다.",
        contents: {
            ruby: 8000000,
            dimension_key: 38500,
            abyss_scroll: 1200,
            time_scroll: 210,
            silver_key: 10
        }
    },
    {
        id: "legendary_growth_full",
        name: "레전더리 성장 패키지 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "한 달에 3번 구매 시 1회 추가 지급 합니다. 유니크와 비슷합니다. 중과금러의 시작.",
        subPackages: [
            {
                id: "legendary_unit",
                name: "레전더리 패키지 (1~3회)",
                price: 33000,
                count: 3,
                contents: {
                    ruby: 300000,
                    dungeon_key: 600,
                    dimension_fragment: 1000,
                    abyss_scroll: 550,
                    mystery_crystal: 55,
                    golden_key: 2
                }
            },
            {
                id: "legendary_bonus",
                name: "3회 구매 보너스",
                price: 0,
                count: 1,
                contents: {
                    ruby: 300000,
                    dungeon_key: 600,
                    dimension_fragment: 1000,
                    abyss_scroll: 550,
                    mystery_crystal: 55,
                    golden_key: 2
                }
            }
        ]
    },
    {
        id: "unique_growth_full",
        name: "유니크 성장 패키지 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "한 주에 2번 구매 시 1회 추가 지급 합니다. 딱 B급 효율입니다. 중과금러의 시작.",
        subPackages: [
            {
                id: "unique_unit",
                name: "유니크 패키지 (1~2회)",
                price: 22000,
                count: 2,
                contents: {
                    ruby: 200000,
                    dungeon_key: 400,
                    dimension_fragment: 700,
                    abyss_scroll: 350,
                    mystery_crystal: 35,
                    golden_key: 1
                }
            },
            {
                id: "unique_bonus",
                name: "2회 구매 보너스",
                price: 0,
                count: 1,
                contents: {
                    ruby: 200000,
                    dungeon_key: 400,
                    dimension_fragment: 700,
                    abyss_scroll: 350,
                    mystery_crystal: 35,
                    golden_key: 1
                }
            }
        ]
    },
    {
        id: "crystal_pkg",
        name: "결정 패키지",
        price: 22000,
        count: 3,
        tier: "C",
        description: "끝없는 영원 결정을 정말 급하게 먹어야 할 때만 사시는 걸 추천드립니다. 칠흑 훈장 패키지 보다도 효율이 낮아요.",
        contents: {
            ruby: 220000,
            dungeon_key: 400,
            unstable_eternal_crystal: 500,
            endless_eternal_crystal: 20000,
            mystery_crystal: 80,
            silver_key: 5
        }
    },
    {
        id: "ruby_pass_full",
        name: "루비 스테이지 패스 (전체 구매)",
        type: "stepup",
        tier: "C",
        description: "루비를 많이 주는 패키지여야 했으나, 요즘 패키지 인플레이션으로 인해 메리트가 많이 죽어버렸습니다.",
        subPackages: [
            { id: "ruby_pass_unit", name: "루비 패스 (1~5회)", price: 33000, count: 5, contents: { ruby: 9000000, silver_key: 10 } },
            { id: "ruby_pass_bonus", name: "완료 보너스", price: 0, count: 1, contents: { ruby: 9999900, dimension_fragment: 2000, golden_key: 5 } }
        ]
    },
    {
        id: "key_pass_full",
        name: "열쇠 스테이지 패스 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "던열만 봤을 때는 정령 패스보다 좋긴 한데, 다른 물품도 봤을 때는 정령 패스가 더 좋다 평가받습니다.",
        subPackages: [
            { id: "key_pass_unit", name: "열쇠 패스 (1~5회)", price: 33000, count: 5, contents: { dungeon_key: 1125, dimension_key: 11250, dimension_fragment: 600, silver_key: 10 } },
            { id: "key_pass_bonus", name: "완료 보너스", price: 0, count: 1, contents: { dungeon_key: 1200, dimension_fragment: 2000, golden_key: 5 } }
        ]
    },
    {
        id: "magic_pass_full",
        name: "마법 성장 패스 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "단순 루비로 환산하면 상당히 효율 좋은 패키지긴 하지만, 마법을 굳이 루비로 뽑는 사람은 극소수일 뿐더러 범용성이 너무 낮습니다.",
        subPackages: [
            { id: "magic_pass_unit", name: "마법 패스 (1~5회)", price: 33000, count: 5, contents: { magic: 22500, dimension_fragment: 600, silver_key: 10 } },
            { id: "magic_pass_bonus", name: "완료 보너스", price: 0, count: 1, contents: { magic: 100000, dimension_fragment: 2000, golden_key: 5 } }
        ]
    },
    {
        id: "spirit_pass_full",
        name: "정령 성장 패스 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "성장 패스류 중에서는 효율이 제일 괜찮다고 평가 받습니다. 그래도 효율이 엄청 좋지는 않아요.",
        subPackages: [
            {
                id: "spirit_pass_unit",
                name: "정령 패스 (1~5회)",
                price: 33000,
                count: 5,
                contents: {
                    dimension_fragment: 600,
                    silver_key: 10,
                    // 50 boxes contents
                    dungeon_key: 15 * 50,
                    dimension_key: 10 * 50,
                    abyss_scroll: 15 * 50,
                    time_scroll: 5 * 50
                }
            },
            {
                id: "spirit_pass_bonus",
                name: "완료 보너스",
                price: 0,
                count: 1,
                contents: {
                    dimension_fragment: 2000,
                    golden_key: 5,
                    // 40 boxes contents
                    dungeon_key: 15 * 40,
                    dimension_key: 10 * 40,
                    abyss_scroll: 15 * 40,
                    time_scroll: 5 * 40
                }
            }
        ]
    },
    {
        id: "monthly_pass",
        name: "월간 패스",
        price: 19000,
        count: 1,
        tier: "S",
        description: "한 달에 한 번 구매 가능한 패스로, 괜찮은 효율을 가집니다.",
        contents: {
            dungeon_key: 1100 + 92, // Base + Random Box EV (9.16 * 10)
            magic: 15000,
            dimension_key: 15000 + 1250, // Base + Random Box EV (125 * 10)
            dimension_fragment: 1200,
            ap: 6000000 + 158333, // Base + Random Box EV (15833 * 10)
            mystery_crystal: 120,
            abyss_scroll: 450,
            golden_key: 1
        }
    },
    {
        id: "season_pass",
        name: "시즌 패스 (프리미엄 + 풀매수/레벨업)",
        price: 22000,
        count: 1,
        tier: "S",
        tierTooltip: "균형의 선각자 이상 장비를 사용하는 후반부 파밍 단계에서는 장비 강화 재화 수급용으로 SSS급 가치가 있습니다.",
        description: "시즌 패스 보상 + 루비 소모형 레벨업 및 시간 구매 반영. 시즌 랜덤 상자 총 47개 기댓값 반영. 재화 효율은 최상급 패키지에 비해 떨어지지만 핫타임을 중시한다면 SS~SSS급도 노려볼 만합니다.",
        contents: {
            ruby: -3710000,           // -21만(레벨) - 350만(시간)
            dungeon_key: 1040 + 196,  // Base(600+440) + (47 boxes * 4.16 EV)
            dimension_key: 14400 + 2742, // Base 14400 + (47 boxes * 58.33 EV)
            abyss_scroll: 235,        // 47 boxes * 5 fixed
            mystery_crystal: 100,     // 20 * 5 levels
            dimension_fragment: 1000, // 200 * 5 levels
            ap: 6000000 + 258500,     // 6M + (47 boxes * 5500 EV)
            event_time: 3250,         // 최대 구매치 반영
            golden_key: 3             // 2 (Lv 45) + 1 (Additional)
        }
    },
    {
        id: "main_quest_complete",
        name: "메인 퀘스트 컴플리트 패키지",
        price: 39000,
        count: 1,
        tier: "A",
        description: "차조가 부족하다면 급하게나마 살 만한 패키지입니다. 효율이 대단히 좋지는 않습니다.",
        contents: {
            golden_key: 10,
            dimension_fragment: 3500,
            mystery_crystal: 100,
            abyss_scroll: 1000
        }
    },
    {
        id: "special_season_pass",
        name: "스페셜 시즌 패스",
        price: 9900,
        count: 1,
        tier: "SS",
        description: "약 2달에 1번 구매 가능합니다. 40일 가정이며, 구매자들을 대상으로 상품을 2번씩 구매 가능하게 한 패치 이후로 효율이 대폭 상승하여 SS급으로 떡상했습니다.",
        contents: {
            ruby: 3000000,
            ap: 3000000,
            dungeon_key: 600 + 240, // Base + Extra choice
            dimension_key: 10000,
            dimension_fragment: 600,
            magic: 20000,
            mystery_crystal: 80,
            abyss_scroll: 1000,
            silver_key: 10
        }
    },
    {
        id: "spirit_appearance",
        name: "정령 외형 패키지",
        price: 33000,
        count: 9,
        tier: "B",
        description: "버프가 있긴 하지만, 룩을 중요시 하지 않는다면 살 이유가 크지는 않은 패키지입니다.",
        contents: {
            ruby: 220000,
            ap: 10000000,
            golden_key: 2,
            time_scroll: 170 + (30 * 5), // Base + Boxes
            dungeon_key: 30 * 15,        // Boxes
            dimension_key: 30 * 10,      // Boxes
            abyss_scroll: 30 * 15,       // Boxes
            spirit_stone_buff: 1.15,
            spirit_trait_point: 10,
            magic_core_level: 15
        }
    },
    {
        id: "world_boss_pass",
        name: "월드 보스 시즌 패스",
        price: 9900,
        count: 1,
        tier: "B",
        description: "시즌 기간 63일로 가정합니다. 재화 효율은 딱 B급 수준이고, 시즌 상품을 빨리 쓰기 위한 그 정도의 의의만 있습니다. 시즌 상품이 좋게 나오면 A도 가능합니다.",
        contents: {
            ruby: 189000,
            honor_medal: 408000,
            faded_medal: 1130000,
            // 랜덤 보상 기댓값 (총 200회 상자 개봉 -> 기댓값 300개 아이템 획득)
            dungeon_key: 291,         // (약 72.75회 * 평균 4개)
            dimension_key: 5456,      // (약 72.75회 * 평균 75개)
            ap: 682031,               // (약 72.75회 * 평균 9375)
            dimension_fragment: 364,  // (약 72.75회 * 평균 5개)
            mystery_crystal: 9        // (3% 기사 기댓값: 300개 * 0.03)
        }
    },
    {
        id: "wb_off_season",
        name: "월드 보스 비시즌 패키지",
        price: 33000,
        count: 5,
        tier: "D",
        description: "빛바랜 명예 훈장을 획득 가능하긴 하지만, 가격에 비해 효과가 너무 낮습니다.",
        contents: {
            ruby: 330000,
            faded_medal: 1500000,
            dungeon_key: 700,
            dimension_fragment: 1400,
            ap: 10000000,
            silver_key: 5
        }
    },
    {
        id: "hunter_support",
        name: "사냥꾼의 기술 지원 패키지",
        price: 33000,
        count: 5,
        tier: "D",
        description: "현 시점 제일 존재 의의를 모르겠는 패키지입니다. 고수들은 하루에 몇십만개씩 파밍하고, 뉴비들은 초반에 지급하는 훈장이 많아서...",
        contents: {
            ruby: 330000,
            hunter_medal: 1000000,
            dungeon_key: 700,
            dimension_fragment: 1400,
            magic: 33000,
            silver_key: 5
        }
    },
    {
        id: "chaos_box",
        name: "혼돈의 상자 패키지",
        price: 16000,
        count: 2,
        tier: "C",
        description: "혼돈 스킬이 급할 때 아니면 살 이유 딱히 없는 패키지입니다.",
        contents: {
            ruby: 1600000,
            dimension_fragment: 400,
            silver_key: 10,
            dungeon_key: 210,
            dimension_key: 3150,
            exploration_key: 105,
            magic: 4200,
            chaos_medal: 2100
        }
    },
    {
        id: "pitch_black_medal",
        name: "칠흑 훈장 패키지",
        price: 16000,
        count: 2,
        tier: "B",
        description: "마스터리 젬 효과로 1000개씩 받는다 가정합니다. 유적지가 급하다면 결정 패키지보다 효율이 좋긴 합니다. 의외로 차조 효율이 괜찮은 편입니다.",
        contents: {
            ruby: 1600000,
            dimension_fragment: 400 + (30 * 15), // Base + Boxes
            silver_key: 10,
            ap: 30 * 15000,               // Boxes
            dungeon_key: 30 * 10,         // Boxes
            magic: 30 * 200,              // Boxes
            endless_eternal_crystal: 30 * 1000 // 30,000 (최대 업글 기준)
        }
    },
    {
        id: "elysia_full",
        name: "엘리시아 스텝업 (전체 구매)",
        type: "stepup",
        tier: "B",
        description: "가격이 비싼 편이므로 모두 구매할 각오가 되어 있지 않다면 함부로 손 대지 않는 걸 추천드립니다. 싼 것만 사서 보너스 받는 건 논외.",
        subPackages: [
            {
                id: "elysia_1",
                name: "엘리시아 1차",
                price: 33000,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 1500000,
                    dungeon_key: 440,
                    exploration_key: 600,
                    dimension_fragment: 1000,
                    mystery_crystal: 45,
                    golden_key: 2
                }
            },
            {
                id: "elysia_2",
                name: "엘리시아 2차",
                price: 55000,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 2500000,
                    dungeon_key: 700,
                    dimension_fragment: 1500,
                    abyss_scroll: 750,
                    mystery_crystal: 75,
                    golden_key: 3
                }
            },
            {
                id: "elysia_3",
                name: "엘리시아 3차",
                price: 110000,
                count: 2,
                tier: "B",
                contents: {
                    ruby: 5000000,
                    dungeon_key: 1650,
                    magic: 50000,
                    abyss_scroll: 1500,
                    mystery_crystal: 150,
                    golden_key: 5
                }
            },
            {
                id: "elysia_bonus",
                name: "엘리시아 보너스",
                price: 0,
                count: 1,
                tier: "B",
                contents: {
                    ruby: 4999900,
                    dungeon_key: 2500,
                    dimension_fragment: 5000,
                    magic: 100000,
                    golden_key: 10,
                    top_amulet: 10
                }
            }
        ]
    }
];
