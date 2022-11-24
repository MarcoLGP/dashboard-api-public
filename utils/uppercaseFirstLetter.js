export default function upperCaseFirstLetter(str) {

    const str_length_split = str.split(' ')
    if (str_length_split > 0) {

        for (let i = 0; i < str_length_split.length; i++) {
            str_length_split[i] = str_length_split[i][0].toUpperCase() + str_length_split[i].substr(1);
        }
        return str_length_split.join(" ")

    } else {

        return str[0].toUpperCase() + str.substring(1);
        
    }
}