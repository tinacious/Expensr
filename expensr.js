$(document).ready(function () {
    MyApp = {};
    MyApp.expenses = [];
    MyApp.Expensr = function Expensr(a, b, c, d, e) {
        this.itemName = a;
        this.whoPaid = b;
        this.participants = c;
        this.cost = d;
        this.payerIsParticipant = e;
    };
    MyApp.People = {};
    function searchStringInArray(str, strArray) {
        for (var j = 0; j < strArray.length; j++) {
            if (strArray[j].match(str)) return 1;
        }
        return 0;
    }
    MyApp.addExpense = function () {
        var itm = $("form#newexpense input#item").val().toLowerCase();
        var wpd = $("form#newexpense input#who_paid").val().toLowerCase();
        var ptcpnts = $("form#newexpense input#participants").val().toLowerCase().split(",");
        //remove empty spaces at the beginning and end of each name
        for( var i =0;i<ptcpnts.length;i++){
            var str = ptcpnts[i].replace(/(^\s+|\s+$)/g,' ');
            ptcpnts[i]=str;
        }
        var ct = parseFloat($("form#newexpense input#cost").val());
        var pisptc = searchStringInArray(wpd, ptcpnts);

        var singleExpenseTemp = new MyApp.Expensr(itm, wpd, ptcpnts, ct, pisptc);
        MyApp.expenses.push(singleExpenseTemp);
        MyApp.calculateDebts();
        MyApp.displayExpenses();
        $('input[type=text]').val('');
    }
    MyApp.removeExpense = function (index) {
        MyApp.expenses.splice(index, 1);
        MyApp.calculateDebts();
        MyApp.displayExpenses();
    }
    MyApp.displayExpenses = function () {
        $("table#expenses tbody").remove();
        for (var i = 0; i < MyApp.expenses.length ; i++) {
            var expenseMarkup = "<tr> <td>"
                + MyApp.expenses[i].itemName + "</td><td>"
                + MyApp.expenses[i].whoPaid + "</td><td>"
                + MyApp.expenses[i].participants + "</td><td>"
                + MyApp.expenses[i].cost + "</td><td>"
            + '<a class="close-icon lsf-icon" title="remove" href="#" onclick="MyApp.removeExpense(' + i + ')">Remove</a>' + '</td></tr>';
            $("table#expenses").append("<tbody>" + expenseMarkup + "<tbody>");
        }
    }
    MyApp.calculateDebts = function () {
        var arraymin = function (array) {
            var currentmin = array[0]
            for (var i = 0; i < array.length; i++) {
                if (array[i] < currentmin) {
                    currentmin = array[i];
                }
            }
            return currentmin;
        }
        var arraymax = function (array) {
            var currentmax = array[0]
            for (var i = 0; i < array.length; i++) {
                if (array[i] > currentmax) {
                    currentmax = array[i];
                }
            }
            return currentmax;
        }
        var argmax = function (array) {
            for (var i = 0; i < array.length; i++) {
                if (arraymax(array) == array[i]) {
                    return i;
                }
            }
        }
        var argmin = function (array) {
            for (var i = 0; i < array.length; i++) {
                if (arraymin(array) == array[i]) {
                    return i;
                }
            }
        }
        MyApp.people = {};
        for (var i = 0; i < MyApp.expenses.length; i++) {
            var tmpCost = MyApp.expenses[i].cost;
            var tmpPayer = MyApp.expenses[i].whoPaid;
            var tmpParticipants = MyApp.expenses[i].participants;
            var tmpPayerParticipates = MyApp.expenses[i].payerIsParticipant;
            var tmpAmountBorrowed = (tmpPayerParticipates == 0) ? tmpCost / tmpParticipants.length : tmpCost / tmpParticipants.length;
            if (!MyApp.people[tmpPayer]) {
                MyApp.people[tmpPayer] = {};
            }
            for (var j = 0; j < tmpParticipants.length; j++) {
                var tmpBorrower = tmpParticipants[j];

                if (!MyApp.people[tmpBorrower]) {
                    MyApp.people[tmpBorrower] = {};
                }

                if (!(MyApp.people[tmpPayer][tmpBorrower])) {
                    MyApp.people[tmpPayer][tmpBorrower] = tmpAmountBorrowed;
                    if (!(MyApp.people[tmpBorrower][tmpPayer])) {
                        MyApp.people[tmpBorrower][tmpPayer] = -tmpAmountBorrowed;
                    } else {
                        MyApp.people[tmpBorrower][tmpPayer] = MyApp.people[tmpBorrower][tmpPayer] - tmpAmountBorrowed;
                    }
                }
                else {
                    MyApp.people[tmpPayer][tmpBorrower] += tmpAmountBorrowed
                    if (!MyApp.people[tmpBorrower][tmpPayer]) {
                        MyApp.people[tmpBorrower][tmpPayer] = -tmpAmountBorrowed;
                    } else {
                        MyApp.people[tmpBorrower][tmpPayer] = MyApp.people[tmpBorrower][tmpPayer] - tmpAmountBorrowed;
                    }
                }
            }
        }
        var c = 0;
        var personmap = {};
        var n = 0;

        for (person in MyApp.people) {
            personmap[c++] = person;
        }
        n = c;


        distances = []
        $('table#payments tbody').remove();
        $('table#payments').append('<tbody></tbody>');
        for (var i = 0; i < n; i++) {
            var sum = 0;
            for (var j = 0; j < n; j++) {
                if (i !== j) {
                    var amt = MyApp.people[personmap[i]][personmap[j]] || 0;
                    sum = sum + amt;
                }
            }
            distances[i] = sum;
        }
        var items = distances;
        var target = 0;
        var result = [];
        for (var i = 0; i < n - 1; i++) {
            var imin = argmin(distances);
            var imax = argmax(distances);
            var amount = arraymin([Math.abs(distances[imin]), Math.abs(distances[imax])]);
            distances[imin] = distances[imin] + amount;
            distances[imax] = distances[imax] - amount;
            if ((amount != 0) && (personmap[imin]!=personmap[imax])) {
                $('table#payments').append("<tr><th>" + personmap[imin] + "</th><th>" + personmap[imax] + '</th><th>' + amount.toFixed(2) + '</th></tr>');
            }
        }
    }
});
