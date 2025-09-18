﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entities
{
    public class BookPurchase
    {
        public int PurchaseId { get; set; }
        public string UserName { get; set; }
        public int ComicId { get; set; }
        public int PaymentMethodId { get; set; }
        public int PaymentStatusId { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.Now;

        public string TransactionId { get; set; }
        public decimal Amount { get; set; }

        public User User { get; set; }
        public Comic Comic { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
    }
}
