using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace lab1.FibonacciImplementations
{
    public class DynamicProgramming
    {
        static public long Fibonacci(long n)
        {
            // Deal with edge cases
            if(n <= 1) return n;

            // Array to store Fibonacci nums
            long[] dynamicProgramming = new long[n + 1];
            dynamicProgramming[0] = 0;
            dynamicProgramming[1] = 1;

            // Fill array iteratively
            for(long i = 2; i <= n; i++)
            {
                dynamicProgramming[i] = dynamicProgramming[i - 1] + dynamicProgramming[i - 2];
            }

            return dynamicProgramming[n];
        }
    }
}