// baziEngine.js
// 八字排盘计算引擎，公历 -> 四柱 -> 五行 -> 十神 -> 大运起运
// 支持前端或 Worker 调用

// 天干地支表
const HeavenlyStems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const EarthlyBranches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const WuXingMap = {
    "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土",
    "庚":"金","辛":"金","壬":"水","癸":"水",
    "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火",
    "午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"
};

// 十神关系表（相对于日干）
const ShiShenMap = {
    "甲":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "乙":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "丙":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "丁":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "戊":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "己":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "庚":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "辛":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "壬":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"],
    "癸":["比肩","劫财","正印","偏印","正财","偏财","七杀","正官","偏印","正印"]
};

// 节气计算（近似算法）
const SolarTermNames = ["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"];
// 节气起始时间表可用公式或精确天文库计算，这里可后续扩展

// 公历转农历（年份、月份、日期 -> 四柱）
// 简化版本，真实项目可接入精确天文算法或现有 JS 库(lunar-js)
function solarToBazi(date){
    // date: Date 对象
    // 返回：{yearPillar, monthPillar, dayPillar, hourPillar, yearStem, yearBranch}
    const year = date.getFullYear();
    const month = date.getMonth()+1; // 1-12
    const day = date.getDate();
    const hour = date.getHours();

    // 年柱
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    const yearPillar = HeavenlyStems[yearStemIndex] + EarthlyBranches[yearBranchIndex];

    // 月柱（粗略公式：立春后算下一干支）
    const monthBranchIndex = (month + 1) % 12; // 1月=寅
    const monthStemIndex = (yearStemIndex*2 + month -1) %10;
    const monthPillar = HeavenlyStems[monthStemIndex] + EarthlyBranches[monthBranchIndex];

    // 日柱（近似算法）
    const baseDate = new Date(1900,0,1);
    const diffDays = Math.floor((date - baseDate)/(24*3600*1000));
    const dayStemIndex = (diffDays + 40) % 10;
    const dayBranchIndex = (diffDays + 12) % 12;
    const dayPillar = HeavenlyStems[dayStemIndex] + EarthlyBranches[dayBranchIndex];

    // 时柱
    const hourBranchIndex = Math.floor((hour+1)/2) %12;
    const hourStemIndex = (dayStemIndex*2 + hourBranchIndex)%10;
    const hourPillar = HeavenlyStems[hourStemIndex] + EarthlyBranches[hourBranchIndex];

    return {yearPillar,monthPillar,dayPillar,hourPillar,yearStem:HeavenlyStems[yearStemIndex]};
}

// 五行统计
function calculateWuXing(fourPillars){
    const tiangan = fourPillars.map(p => WuXingMap[p[0]]);
    const dizhi = fourPillars.map(p => WuXingMap[p[1]]);
    const canggan = fourPillars.map(p => p); // 简化，可用藏干规则
    return {tiangan,dizhi,canggan};
}

// 十神推算（相对于日干）
function calculateShiShen(fourPillars, dayStem){
    const tiangan = fourPillars.map(p => ShiShenMap[dayStem][HeavenlyStems.indexOf(p[0])]);
    const dizhi = fourPillars.map(p => "偏财"); // 简化示例
    return {tiangan,dizhi};
}

// 大运起运
function calculateStartLuck(birthDate,gender){
    // 简单示例：出生后7岁起运
    const startAge = 7;
    const startDate = new Date(birthDate);
    startDate.setFullYear(startDate.getFullYear() + startAge);
    return {age:startAge, date:startDate.toISOString().split("T")[0]};
}

// 大运列表
function getLuckCycles(birthDate,gender){
    const cycles = [];
    const baseLuck = calculateStartLuck(birthDate,gender);
    const pillars = ["甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉","甲戌","乙亥"];
    for(let i=0;i<10;i++){
        const step=i+1;
        const luckPillar=pillars[i%pillars.length];
        const startAge=baseLuck.age + i*10;
        const startDate=new Date(birthDate);
        startDate.setFullYear(startDate.getFullYear() + startAge);
        cycles.push({
            step,
            luckPillar,
            startAge,
            startDate:startDate.toISOString().split("T")[0],
            wuXing:{tiangan:WuXingMap[luckPillar[0]],dizhi:WuXingMap[luckPillar[1]],canggan:luckPillar},
            shiShen:{tiangan:"比肩",dizhi:"偏财"}
        });
    }
    return cycles;
}

// 主接口
export async function calculateBazi(birth){
    const date = new Date(birth);
    const fourPillarsObj = solarToBazi(date);
    const fourPillars = [fourPillarsObj.yearPillar,fourPillarsObj.monthPillar,fourPillarsObj.dayPillar,fourPillarsObj.hourPillar];
    const wuXingFull = calculateWuXing(fourPillars);
    const shiShen = calculateShiShen(fourPillars,fourPillarsObj.dayStem);
    const startLuck = calculateStartLuck(date,1);
    const luckCycles = getLuckCycles(date,1);
    return {fourPillars,wuXingFull,shiShen,startLuck,luckCycles};
}
