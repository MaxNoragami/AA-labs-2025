using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace lab1.FibonacciImplementations
{
    public class Memoization
    {
        static private Dictionary<long, long> _memo = new Dictionary<long, long>();
        static public long Fibonacci(long n)
        {
            
            if(n <= 1) return n;

            // This line makes difference, we memorize value
            if(_memo.TryGetValue(n, out long value)) return value;

            _memo[n] = Fibonacci(n - 1) + Fibonacci(n - 2);

            return _memo[n];
        } 
    }
}