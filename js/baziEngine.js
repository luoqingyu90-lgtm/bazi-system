const TianGan = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const DiZhi = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

function getGanZhi(index){
    return TianGan[index % 10] + DiZhi[index % 12];
}

function getYearGanZhi(year){
    return getGanZhi(year - 4);
}

function getDayGanZhi(date){
    const base = new Date(1900,0,31);
    const diff = Math.floor((date - base)/86400000);
    return getGanZhi(diff);
}

function getHourGanZhi(dayGanZhi, hour){
    const dayIndex = TianGan.indexOf(dayGanZhi[0]);
    const hourIndex = Math.floor((hour + 1)/2) % 12;
    const ganIndex = (dayIndex * 2 + hourIndex) % 10;
    return TianGan[ganIndex] + DiZhi[hourIndex];
}

export function calculateBaZi(birthStr, gender){
    const date = new Date(birthStr);
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const hour = date.getHours();

    const yearGZ = getYearGanZhi(year);
    const dayGZ = getDayGanZhi(date);
    const hourGZ = getHourGanZhi(dayGZ, hour);

    return {
        year: yearGZ,
        day: dayGZ,
        hour: hourGZ
    };
}
