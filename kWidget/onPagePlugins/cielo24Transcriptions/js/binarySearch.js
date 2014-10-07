var BinarySearch = {};
(function() {
    BinarySearch = function(arr,search,comparitor) {
        if(!arr) return -1;
// as long as it has a length i will try and itterate over it.
        if(arr.length === undefined) return -1;
        if(!comparitor) comparitor = BinarySearch._defaultComparitor();
        return bs(arr,search,comparitor);
    };

    BinarySearch.first = function(arr,search,comparitor) {
        return BinarySearch.closest(arr,search,{exists:true},comparitor);
    };

    BinarySearch.last = function(arr,search,comparitor) {
        return BinarySearch.closest(arr,search,{exists:true,end:true},comparitor);
    };

    BinarySearch.closest = function(arr,search,opts,comparitor) {
        if(typeof opts === 'function') {
            comparitor = opts;
            opts = {};
        }
        if(arr.length === 0) return -1;
        if(arr.length === 1) return 0;
        opts = opts||{};
        if(!comparitor) comparitor = this._defaultComparitor();
        var closest = bsclosest(arr, search, comparitor, opts.end, opts.exists?false:true);
        if(closest > arr.length-1) closest = arr.length-1;
        else if(closest < 0) closest = 0;
        return closest;
    };

// inserts element into the correct sorted spot into the array
    BinarySearch.insert = function(arr,search,opts,comparitor){
        if(typeof opts === 'function') {
            comparitor = opts;
            opts = {};
        }
        opts = opts||{};
        if(!comparitor) comparitor = BinarySearch._defaultComparitor();
        if(!arr.length) {
            arr[0] = search;
            return 0;
        }
        var closest = BinarySearch.closest(arr,search,comparitor);
        var cmp = comparitor(arr[closest],search);
        if(cmp < 0) {//less
            arr.splice(++closest,0,search);
        } else if(cmp > 0){
            arr.splice(closest,0,search);
        } else {
            if(opts.unique){
                arr[closest] = search;
            } else {
// im equal. this value should be appended to the list of existing same sorted values.
                while(comparitor(arr[closest],search) === 0){
                    if(closest >= arr.length-1) break;
                    closest++;
                }
                arr.splice(closest,0,search);
            }
        }
        return closest;
    };

// this method returns the start and end indicies of a range. [start,end]
    BinarySearch.range = function(arr,from,to,comparitor) {
        if(!comparitor) comparitor = BinarySearch._defaultComparitor();
        var fromi = BinarySearch.closest(arr,from,comparitor);
        var toi = BinarySearch.closest(arr,to,{end:true},comparitor);
// this is a hack.
// i should be able to fix the algorithm and generate a correct range.
        while(fromi <= toi){
            if(comparitor(arr[fromi],from) > -1) break;
            fromi++
        }
        while(toi >= fromi){
            if(comparitor(arr[toi],to) < 1) break;
            toi--;
        }
        return [fromi,toi];
    };

// this method returns the values of a range;
    BinarySearch.rangeValue = function(arr,from,to,comparitor){
        var range = BinarySearch.range(arr,from,to,comparitor);
        return arr.slice(range[0],range[1]+1);
    };

//
    BinarySearch.indexObject = function(o,extractor) {
        var index = [];
        Object.keys(o).forEach(function(k){
            index.push({k:k,v:extractor(o[k])});
        });
        return index.sort(function(o1,o2){
            return o1.v - o2.v;
        });
    };

    BinarySearch.cmp = function(v1,v2){
        return v1 - v2;
    };

    BinarySearch._defaultComparitor = function() {
        var indexMode,indexModeSearch;
        return function(v,search){
// support the object format of generated indexes
            if(indexMode === undefined){
                if(typeof v === 'object' && v.hasOwnProperty('v')) indexMode = true;
                if(typeof search === 'object' && search.hasOwnProperty('v')) indexModeSearch = true
            }
            if(indexMode) v = v.v;
            if(indexModeSearch) search = search.v;
            return v - search;
        };
    };

    BinarySearch._binarySearch = bs;
    BinarySearch._binarySearchClosest = bsclosest;

    function bs(arr, search, comparitor) {
        var max = arr.length-1,min = 0,middle,cmp;
// continue searching while key may exist
        while (max >= min) {
            middle = mid(min, max);
            cmp = comparitor(arr[middle],search,middle);
            if (cmp < 0) {
                min = middle + 1;
            } else if (cmp > 0) {
                max = middle - 1;
            } else {
                return middle;
            }
        }
// key not found
        return -1;
    }

    function bsclosest(arr, search, comparitor, invert, closest) {
        var mids = {}
            , min = 0,max = arr.length-1,middle,cmp
            , sanity = arr.length;
        while (min < max) {
            middle = midCareful(min, max,mids);
            cmp = comparitor(arr[middle],search,middle);
            if(invert){
                if (cmp > 0)max = middle - 1;
                else min = middle;
            } else {
                if (cmp < 0)min = middle + 1;
                else max = middle;
            }
            if(!--sanity) break;
        }
        if (max == min && comparitor(arr[min],search) === 0) return min;
        if(closest) {
            var match = comparitor(arr[min],search);
            if(min == arr.length-1 && match < 0) return min;
            if(min == 0 && match > 0) return 0;
            return closest?(invert?min+1:min-1):-1;
        }
        return -1;
    }

    function mid(v1,v2){
        return v1+Math.floor((v2-v1)/2);
    }

    function midCareful(v1,v2,mids){
        var mid = v1+Math.floor((v2-v1)/2);
        if(mids[mid]) mid = v1+Math.ceil((v2-v1)/2);
        mids[mid] = 1;
        return mid;
    }

})();
