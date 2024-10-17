// callback là một hàm ở trong một hàm khác

function greet(name, callback) {
    console.log("Xin chào, " + name + "!");
    callback();
}

function sayGoodbye() {
    console.log("Tạm biệt!");
}

greet("An", sayGoodbye);

function doSomething(callback) {
    console.log("Bắt đầu công việc...");
    setTimeout(() => {
        console.log("Hoàn thành công việc!");
        callback(); // Gọi lại callback sau khi công việc hoàn thành
    }, 2000);
}

function finish() {
    console.log("Công việc đã hoàn tất!");
}

doSomething(finish);
