import SparkMD5 from 'spark-md5'

export const pattern = {
    //中文、英文、数字包括下划线
    namePattern: /^[\u4E00-\u9FA5A-Za-z0-9_]{3,10}$/,
    //必须包含数字字母
    pwdPattern: /^(?=.*\d)(?=.*[a-zA-Z]).{4,16}$/
}

export function patternFn(patternType, value, message) {
    if (!pattern[patternType].test(value) || /\s/.test(value)) {
        return message
    }
}

export function checkLocal() {
    const t = localStorage.getItem('TOKEN')
    if (!t) return false
    let array = t.split('.')
    if (array.length !== 3) return false
    try {
        let h = array[0],
            p = array[1],
            sig = array[2]
        if (JSON.parse(atob(h)).alg !== 'alg' && JSON.parse(atob(h)).typ !== 'JWT') {
            return false
        }
        if (JSON.parse(atob(p)).length !== 3 && sig.length !== 43) {
            return false
        }
    } catch (e) {
        return false
    }
    return true
}

export function formatDate(timestamp) {
    let date = new Date(Number(timestamp)),
        YY = date.getFullYear() + '-',
        MM = String(date.getMonth() + 1).padStart(2, '0') + '-',
        DD = String(date.getDate()).padStart(2, '0'),
        hh = String(date.getHours()).padStart(2, '0') + ':',
        mm = String(date.getMinutes()).padStart(2, '0') + ':',
        ss = String(date.getSeconds()).padStart(2, '0')
    return YY + MM + DD + " " + hh + mm + ss
}

export function formatNow(timestamp) {
    let nTime = new Date() - timestamp,
        date = new Date(Number(timestamp)),
        YY = date.getFullYear(),
        MM = String(date.getMonth() + 1).padStart(2, '0'),
        DD = String(date.getDate()).padStart(2, '0'),
        hh = String(date.getHours()).padStart(2, '0'),
        mm = String(date.getMinutes()).padStart(2, '0'),
        ss = String(date.getSeconds()).padStart(2, '0'),
        toDay = new Date(new Date().toLocaleDateString()).getTime(),
        yesDay = toDay - 86400000,
        qDay = toDay - 86400000 * 2,
        d = Math.floor(nTime / 86400000),
        w = Math.floor(d / 7),
        M = Math.floor(d / 30),
        Y = Math.floor(d / 365),
        s = Math.floor(nTime / 1000),
        m = Math.floor(s / 60),
        h = Math.floor(m / 60)
    if (date > toDay) return hh + ':' + mm
    if (date > yesDay && date <= toDay) return `昨天 ${hh + ':' + mm}`
    if (date > qDay && date <= yesDay) return `前天 ${hh + ':' + mm}`
    if (M <= 12)  return `${MM}-${DD} ${hh}:${mm}`
    return `${YY}-${MM}-${DD} ${hh}:${mm}`
    // if (s < 5) return `刚刚`
    // if (s < 60) return `${s} 秒前`
    // if (1 <= m && m < 60) return `${m} 分钟前`
    // if (1 <= h && h < 24) return `${h} 小时前`
    // if (1 <= d && d < 7) return `${d} 天前`
    // if (1 <= w && w <= 4) return `${w} 周前`
    // if (1 <= M && M <= 12) return `${M} 月前`
    // if (M > 12) return formatDate(timestamp)
}

export function formatLevel(EXP) {
    if (EXP < 200) {
        return '-21px -46px;200'
    } else if (EXP < 1500) {
        return '-21px -82px;1500'
    } else if (EXP < 4500) {
        return '-21px -118px;4500'
    } else if (EXP < 10800) {
        return '-21px -154px;10800'
    } else if (EXP < 28800) {
        return '-21px -190px;28800'
    } else if (EXP < 115000) {
        return '-21px -226px;115000'
    } else if (EXP < 193000) {
        return '-21px -262px;193000'
    } else if (EXP < 300000) {
        return '-21px -298px;300000'
    } else {
        return '-21px -334px;999999'
    }
}

export const calculate = (file, callBack) => {
    let fileReader = new FileReader(),
        blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
        chunkSize = 2097152,
        chunks = Math.ceil(file.size / chunkSize),
        currentChunk = 0,
        spark = new SparkMD5()
    fileReader.onload = e => {
        spark.appendBinary(e.target.result)
        currentChunk++
        if (currentChunk < chunks) {
            loadNext()
        } else {
            callBack(spark.end())
        }
    }
    const loadNext = () => {
        let start = currentChunk * chunkSize,
            end = start + chunkSize >= file.size ? file.size : start + chunkSize
        fileReader.readAsBinaryString(blobSlice.call(file, start, end))
    }
    loadNext()
}
