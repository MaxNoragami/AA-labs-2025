using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace lab1.FibonacciImplementations
{
    public class Recursive
    {
        static public decimal Fibonacci(decimal n)
        {
            if(n <= 1) 
            {
                return n;
            }
            else
            {
                return Fibonacci(n - 1) + Fibonacci(n - 2);
            }
        }
    }
}