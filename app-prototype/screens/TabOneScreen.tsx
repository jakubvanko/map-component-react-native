import {StyleSheet, Dimensions, Button, Picker} from 'react-native';

import {Text, View} from '../components/Themed';
import {RootTabScreenProps} from '../types';
import {WebView} from 'react-native-webview';
import {useEffect, useState} from "react";

export default function TabOneScreen({navigation}: RootTabScreenProps<'TabOne'>) {
    const [ref, setRef] = useState<any>(undefined);
    useEffect(() => {
        setTimeout(() => {
            if (ref !== undefined) {
                ref.injectJavaScript("getJsonPoints();");
            }
        }, 3000);
    }, [ref]);
    const [pointArray, setPointArray] = useState<any>([]);
    const [firstSelectedValue, setFirstSelectedValue] = useState<string>("");
    const [secondSelectedValue, setSecondSelectedValue] = useState<string>("");

    return (
        <View style={styles.container}>
            <WebView
                ref={(r) => (setRef(r))}
                style={styles.webview}
                source={{uri: "https://mapcanvas.surge.sh"}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) => {
                    setPointArray(JSON.parse(event.nativeEvent.data));
                    setFirstSelectedValue(pointArray[0]);
                }}
            />

            <View style={styles.buttonholder}>
                <View>
                    <Text>Pick Start Point:</Text>
                    <Picker
                        selectedValue={firstSelectedValue}
                        onValueChange={(itemValue, itemIndex) => setFirstSelectedValue(itemValue)}
                    >
                        {
                            pointArray
                                .filter((point: any) => point.type === "ROOM_ENTRY")
                                .sort((point1: any, point2: any) => point1.data.room > point2.data.room)
                                .map((point: any, index: number) =>
                                    <Picker.Item key={index} label={point.data.room}
                                                 value={`{"x": ${point.x}, "y": ${point.y}, "image": "${point.image}"}`}/>)
                        }
                    </Picker>
                </View>
                <View>
                    <Text>Pick End Point:</Text>
                    <Picker
                        selectedValue={secondSelectedValue}
                        onValueChange={(itemValue, itemIndex) => setSecondSelectedValue(itemValue)}
                    >
                        {
                            pointArray
                                .filter((point: any) => point.type === "ROOM_ENTRY")
                                .sort((point1: any, point2: any) => point1.data.room > point2.data.room)
                                .map((point: any, index: number) =>
                                    <Picker.Item key={index} label={point.data.room}
                                                 value={`{"x": ${point.x}, "y": ${point.y}, "image": "${point.image}"}`}/>)
                        }
                    </Picker>
                </View>
                <Button
                    title="Navigate"
                    color={"darkblue"}
                    onPress={() => ref.injectJavaScript(`drawPath(${firstSelectedValue}, ${secondSelectedValue});`)}
                />
                <Button
                    title="Up"
                    onPress={() => ref.injectJavaScript("moveUp();")}
                />
                <Button
                    title="Down"
                    onPress={() => ref.injectJavaScript("moveDown();")}
                />
            </View>
        </View>
    );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    webview: {
        width: windowWidth
    },
    buttonholder: {
        width: '100%',
        display: "flex"
    }
});
